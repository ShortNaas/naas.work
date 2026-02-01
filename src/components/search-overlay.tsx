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
}: {
  open: boolean;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<SearchIndex | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setLoading(true);
    setError(false);
    fetch("/api/search")
      .then((res) => res.json())
      .then((json: SearchIndex) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
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
  const milestones = sortByPriority(
    (data?.milestones ?? []).filter((m) => matchesQuery(m, nq)),
    nq
  );
  const total = posts.length + projects.length + milestones.length;
  const isExternal = (url: string) => url.startsWith("http://") || url.startsWith("https://");

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
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
            placeholder="Search posts, projects, milestones..."
            className="flex-1 min-w-0 bg-transparent text-[color:var(--foreground)] placeholder:text-[color:var(--text-muted-color)] outline-none"
            aria-label="Search"
            autoComplete="off"
          />
          <kbd className="hidden sm:inline text-xs text-[color:var(--text-muted-color)] px-2 py-1 rounded bg-[var(--card-bg)] border border-[var(--main-border-color)]">
            Esc
          </kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
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
                  {nq ? "No results." : "Type to search posts, projects, milestones."}
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
                  {milestones.length > 0 && (
                    <li className="px-4 py-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-[color:var(--text-muted-color)]">
                        Milestones
                      </span>
                      <ul className="mt-1 list-none p-0 m-0">
                        {milestones.map((item) => (
                          <li key={item._id}>
                            <Link
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
                            </Link>
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
