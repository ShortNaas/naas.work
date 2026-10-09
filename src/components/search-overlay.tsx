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
  return (
    normalize(item.title ?? "").includes(nq) ||
    normalize(item.snippet ?? "").includes(nq)
  );
}

/** Title match = higher priority (0); body/snippet-only match = lower (1). */
function searchPriority(item: SearchIndexItem, q: string): number {
  return normalize(item.title ?? "").includes(normalize(q)) ? 0 : 1;
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

/**
 * Rendered as a native <dialog>, which supplies the modal behaviour we would
 * otherwise hand-roll: focus trap, Escape to close, inert background, focus
 * restore on close, and top-layer stacking above every z-index.
 */
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Escape closes the dialog natively; mirror that back into React state.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

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
    <dialog
      ref={dialogRef}
      aria-label="Search"
      className="w-screen h-screen max-w-none max-h-none m-0 p-0 bg-transparent backdrop:bg-black/50"
    >
      <div
        className="flex items-start justify-center pt-[15vh] px-4"
        // A click on the backdrop lands on this wrapper, not on the panel.
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="w-full max-w-xl rounded-lg bg-[var(--background)] shadow-xl border border-[var(--main-border-color)] overflow-hidden">
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
            ) : total === 0 ? (
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
          </div>
        </div>
      </div>
    </dialog>
  );
}
