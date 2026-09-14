"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconSearch } from "./icons";
import type { SearchIndex, SearchIndexItem } from "@/app/api/search/route";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function matchesQuery(item: SearchIndexItem, q: string): boolean {
  const nq = normalize(q);
  if (!nq) return true;
  const title = normalize(item.title ?? "");
  const snippet = normalize(item.snippet ?? "");
  return title.includes(nq) || snippet.includes(nq);
}

/** Title match = higher priority (0); body/snippet-only match = lower (1). */
function searchPriority(item: SearchIndexItem, q: string): number {
  const nq = normalize(q);
  if (!nq) return 0;
  const titleMatch = normalize(item.title ?? "").includes(nq);
  return titleMatch ? 0 : 1;
}

function sortByPriority<T extends SearchIndexItem>(items: T[], query: string): T[] {
  return [...items].sort((a, b) => searchPriority(a, query) - searchPriority(b, query));
}

/** Short preview for display (avoid huge body in UI). */
function snippetPreview(snippet: string | undefined, maxLen = 120): string {
  if (!snippet || !snippet.trim()) return "";
  const t = snippet.trim();
  return t.length <= maxLen ? t : t.slice(0, maxLen).trim() + "…";
}

export function SearchOverlay({
  open,
  onClose,
  data,
  loading,
  error,
}: {
  open: boolean;
  onClose: () => void;
  data: SearchIndex | null;
  loading: boolean;
  error: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");

  // Focus the input on open, and put focus back where it came from on close.
  // Body scroll is locked while the dialog is open.
  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [open]);

  // Escape closes; Tab is kept inside the dialog because it declares aria-modal.
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const nq = query.trim().toLowerCase();
  const posts = sortByPriority(
    (data?.posts ?? []).filter((p) => matchesQuery(p, nq)),
    nq
  );
  const projects = sortByPriority(
    (data?.projects ?? []).filter((p) => matchesQuery(p, nq)),
    nq
  );
  const total = posts.length + projects.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        className="w-full max-w-xl rounded-lg bg-[var(--background)] shadow-xl border border-[var(--main-border-color)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--main-border-color)]">
          <IconSearch className="w-5 h-5 shrink-0 text-[color:var(--text-muted-color)]" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, projects..."
            className="flex-1 min-w-0 bg-transparent text-[color:var(--foreground)] placeholder:text-[color:var(--text-muted-color)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--link-color)]"
            aria-label="Search"
            autoComplete="off"
          />
          <kbd className="hidden sm:inline text-xs text-[color:var(--text-muted-color)] px-2 py-1 rounded bg-[var(--card-bg)] border border-[var(--main-border-color)]">
            Esc
          </kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto" aria-live="polite">
          {loading ? (
            <p className="px-4 py-8 text-center text-[color:var(--text-muted-color)]">
              Loading…
            </p>
          ) : error ? (
            <p className="px-4 py-8 text-center text-[color:var(--text-muted-color)]">
              Search unavailable. Try again later.
            </p>
          ) : (
            <>
              {total === 0 ? (
                <p className="px-4 py-8 text-center text-[color:var(--text-muted-color)]">
                  {nq ? "No results." : "Type to search posts, projects."}
                </p>
              ) : (
                <ul className="py-2 list-none p-0 m-0">
                  {posts.length > 0 && (
                    <li className="px-4 py-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--text-muted-color)]">
                        Blog
                      </span>
                      <ul className="mt-1 list-none p-0 m-0">
                        {posts.map((item) => (
                          <li key={item._id}>
                            <Link
                              href={item.url}
                              onClick={() => onClose()}
                              className="block px-3 py-2 rounded-md text-[color:var(--foreground)] hover:bg-[var(--sidebar-hover-bg)] no-underline"
                            >
                              <span className="font-medium">{item.title}</span>
                              {snippetPreview(item.snippet) && (
                                <span className="block text-sm text-[color:var(--text-muted-color)] truncate mt-0.5">
                                  {snippetPreview(item.snippet)}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  )}
                  {projects.length > 0 && (
                    <li className="px-4 py-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--text-muted-color)]">
                        Projects
                      </span>
                      <ul className="mt-1 list-none p-0 m-0">
                        {projects.map((item) => (
                          <li key={item._id}>
                            <a
                              href={item.url}
                              onClick={() => onClose()}
                              className="block px-3 py-2 rounded-md text-[color:var(--foreground)] hover:bg-[var(--sidebar-hover-bg)] no-underline"
                            >
                              <span className="font-medium">{item.title}</span>
                              {item.snippet && (
                                <span className="block text-sm text-[color:var(--text-muted-color)] truncate mt-0.5">
                                  {item.snippet}
                                </span>
                              )}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  )}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
