"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useToc } from "@/contexts/toc-context";
import { useActiveHeading } from "@/lib/use-active-heading";
import { BounceSidebar } from "@/components/bounce-sidebar";

export type LatestPost = {
  _id: string;
  title: string;
  url: string;
};

export function RightPanel({ posts }: { posts: LatestPost[] }) {
  const { toc } = useToc();

  // Stable primitive dep list for the observer; the toc array identity changes
  // on every provider render.
  const ids = useMemo(() => (toc ?? []).map((item) => item.id), [toc]);
  const activeIndex = useActiveHeading(ids);

  const items = useMemo(
    () =>
      (toc ?? []).map((item) => ({
        label: item.text,
        href: `#${item.id}`,
      })),
    [toc]
  );

  if (toc && toc.length > 0) {
    return (
      <div className="mt-12 sticky top-6">
        <div className="pb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted-color)]">
          Contents
        </div>
        <BounceSidebar
          items={items}
          value={activeIndex}
          aria-label="On this page"
        />
      </div>
    );
  }

  return (
    <div className="access mt-12">
      <section className="border-l border-[var(--main-border-color)] pl-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted-color)]" style={{ fontSize: "1.0rem" }}>
          Recent Articles
        </div>
        <ul className="mt-2 list-none p-0 m-0 space-y-1.5 text-[1.05em]">
          {posts.length === 0 ? (
            <li className="text-[color:var(--text-muted-color)]">No posts yet.</li>
          ) : (
            posts.map((p) => (
              <li key={p._id} className="truncate">
                <Link
                  href={p.url}
                  className="text-[color:var(--text-color)] hover:text-[color:var(--link-color)] hover:underline no-underline"
                >
                  {p.title}
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
