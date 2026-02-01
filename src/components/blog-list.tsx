"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDateYYYYMMDD } from "@/lib/format-date";
import type { Post } from "@/lib/sanity/types";

type SortBy = "title" | "date" | "popular";

function sortPosts(
  posts: Post[],
  sortBy: SortBy,
  asc: boolean,
  _viewCounts?: Record<string, number>
): Post[] {
  const sorted = [...posts];
  if (sortBy === "title") {
    sorted.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
  } else if (sortBy === "popular") {
    // Sort by view counts when viewCounts is provided; otherwise newest first.
    if (_viewCounts && Object.keys(_viewCounts).length > 0) {
      sorted.sort((a, b) => {
        const pathA = `/blog/${a.slug?.current ?? ""}`;
        const pathB = `/blog/${b.slug?.current ?? ""}`;
        const va = _viewCounts[pathA] ?? 0;
        const vb = _viewCounts[pathB] ?? 0;
        return vb - va;
      });
    } else {
      sorted.sort((a, b) => {
        const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return db - da; // newest first as placeholder for "popular"
      });
    }
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
  popular: false,
};

export function BlogList({
  posts,
  viewCounts,
}: {
  posts: Post[];
  viewCounts?: Record<string, number>;
}) {
  const [sortBy, setSortBy] = useState<SortBy>("title");
  const [sortAsc, setSortAsc] = useState(true);

  const sortedPosts = useMemo(
    () => sortPosts(posts, sortBy, sortAsc, viewCounts),
    [posts, sortBy, sortAsc, viewCounts]
  );

  const handleSort = (key: SortBy) => {
    if (sortBy === key) {
      setSortAsc((a) => !a);
    } else {
      setSortBy(key);
      setSortAsc(defaultAsc[key]);
    }
  };

  if (posts.length === 0) {
    return (
      <p className="text-sm text-[color:var(--text-muted-color)]">No posts yet.</p>
    );
  }

  const sortBtn = (key: SortBy, label: string) => {
    const isActive = sortBy === key;
    const dir = isActive ? (sortAsc ? " ↑" : " ↓") : "";
    return (
      <button
        type="button"
        onClick={() => handleSort(key)}
        className={`cursor-pointer mr-3 text-sm transition-colors ${isActive ? "text-[color:var(--link-color)]" : "text-[color:var(--text-muted-color)] hover:text-[color:var(--heading-color)]"}`}
      >
        {label}{dir}
      </button>
    );
  };

  return (
    <>
      <div className="mb-5 text-sm text-[color:var(--text-muted-color)]">
        Sort by: {sortBtn("title", "title")}
        {sortBtn("date", "date")}
        {sortBtn("popular", "popular")}
      </div>
      <ul className="list-none p-0 m-0 space-y-2">
        {sortedPosts.map((post) => (
          <li key={post._id}>
            <Link
              href={`/blog/${post.slug.current}`}
              className="no-underline group flex flex-wrap items-baseline gap-x-1"
            >
              <span className="font-semibold text-[color:var(--heading-color)] group-hover:text-[color:var(--link-color)] transition-colors" style={{ fontSize: "0.875rem" }}>
                {post.title}
              </span>
              <span className="text-[color:var(--text-muted-color)]" style={{ fontSize: "0.75rem" }}>–</span>
              <time
                dateTime={post.publishedAt}
                className="text-[color:var(--text-muted-color)]"
                style={{ fontSize: "0.75rem" }}
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
