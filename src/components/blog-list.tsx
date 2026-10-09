"use client";

import { useMemo } from "react";
import Link from "next/link";
import { formatDateYYYYMMDD } from "@/lib/format-date";
import type { Post } from "@/lib/sanity/types";
import { SortControls, useSort } from "@/components/sort-controls";

type SortBy = "date" | "title" | "popular";
export type ViewCounts = Record<string, number>;

/**
 * Comparators sort ascending internally and the shared `asc` flag flips the
 * result, so every mode must pick a `defaultAsc` that lands on its intended
 * direction: newest/longest-first for date, most-viewed-first for popular.
 */
function sortPosts(
  posts: Post[],
  sortBy: SortBy,
  asc: boolean,
  viewCounts?: ViewCounts
): Post[] {
  const sorted = [...posts];
  if (sortBy === "title") {
    sorted.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
  } else if (sortBy === "popular") {
    sorted.sort((a, b) => {
      const va = viewCounts?.[`/blog/${a.slug?.current ?? ""}`] ?? 0;
      const vb = viewCounts?.[`/blog/${b.slug?.current ?? ""}`] ?? 0;
      // Break ties by date so equal-view posts stay in a stable order.
      if (va === vb) {
        const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return db - da;
      }
      return va - vb;
    });
  } else {
    sorted.sort((a, b) => {
      const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return da - db;
    });
  }
  if (!asc) sorted.reverse();
  return sorted;
}

const defaultAsc: Record<SortBy, boolean> = {
  title: true,
  date: false,
  // The comparator sorts least-viewed first, so the shared reverse() is what
  // puts the most-viewed posts on top.
  popular: false,
};

const sortOptions: { key: SortBy; label: string }[] = [
  { key: "date", label: "date" },
  { key: "title", label: "title" },
  { key: "popular", label: "popular" },
];

export function BlogList({
  posts,
  viewCounts,
}: {
  posts: Post[];
  viewCounts?: ViewCounts;
}) {
  const { sortBy, sortAsc, toggle } = useSort<SortBy>("date", defaultAsc);

  const sortedPosts = useMemo(
    () => sortPosts(posts, sortBy, sortAsc, viewCounts),
    [posts, sortBy, sortAsc, viewCounts]
  );

  if (posts.length === 0) {
    return (
      <p className="text-sm text-[color:var(--text-muted-color)]">No posts yet.</p>
    );
  }

  return (
    <>
      <SortControls
        options={sortOptions}
        sortBy={sortBy}
        sortAsc={sortAsc}
        onToggle={toggle}
      />
      <ul className="list-none p-0 m-0 space-y-2">
        {sortedPosts.map((post) => (
          <li key={post._id}>
            <Link
              href={`/blog/${post.slug.current}`}
              className="no-underline group flex flex-wrap items-baseline gap-x-1"
            >
              <span className="font-semibold text-[color:var(--heading-color)] group-hover:text-[color:var(--link-color)] transition-colors">
                {post.title}
              </span>
              <span aria-hidden className="text-[color:var(--text-muted-color)]">
                –
              </span>
              <time
                dateTime={post.publishedAt}
                className="text-[color:var(--text-muted-color)]"
              >
                {formatDateYYYYMMDD(post.publishedAt)}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
