"use client";

import Link from "next/link";
import { useToc } from "@/contexts/toc-context";

export type LatestPost = {
  _id: string;
  title: string;
  url: string;
};

export function RightPanel({ posts }: { posts: LatestPost[] }) {
  const { toc } = useToc();

  if (toc && toc.length > 0) {
    return (
      <div className="access mt-12 sticky top-6">
        <section className="border-l border-[var(--main-border-color)] pl-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted-color)]" style={{ fontSize: "1.0rem" }}>
            Contents
          </div>
          <ul className="mt-2 list-none p-0 m-0 space-y-1 text-[1.05em]">
            {toc.map((item) => (
              <li
                key={item.id}
                className={item.level === 3 ? "pl-3" : ""}
              >
                <a
                  href={`#${item.id}`}
                  className="text-[color:var(--text-color)] hover:text-[color:var(--link-color)] hover:underline no-underline"
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </section>
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
