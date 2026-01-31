"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToc } from "@/contexts/toc-context";

type LatestPost = {
  _id: string;
  title: string;
  url: string;
};

export function RightPanel() {
  const { toc } = useToc();
  const [posts, setPosts] = useState<LatestPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/panel/latest-posts")
      .then((r) => r.json())
      .then((json: LatestPost[]) => setPosts(Array.isArray(json) ? json : []))
      .finally(() => setLoading(false));
  }, []);

  if (toc && toc.length > 0) {
    return (
      <div className="access mt-12 sticky top-6">
        <section className="border-l border-[var(--main-border-color)] pl-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted-color)]">
            Contents
          </h2>
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
        <h2 className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted-color)]">
          Recently Updated
        </h2>
        <ul className="mt-2 list-none p-0 m-0 space-y-1.5 text-[1.05em]">
          {loading ? (
            <li className="text-[color:var(--text-muted-color)]">Loading…</li>
          ) : posts.length === 0 ? (
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

