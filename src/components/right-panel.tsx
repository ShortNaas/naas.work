import Link from "next/link";

export type LatestPost = {
  _id: string;
  title: string;
  url: string;
};

export function RightPanel({ posts }: { posts: LatestPost[] }) {
  return (
    <div className="access mt-12">
      <section className="border-l border-[var(--main-border-color)] pl-4">
        <div
          className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted-color)]"
          style={{ fontSize: "1.0rem" }}
        >
          Recent Articles
        </div>
        <ul className="mt-2 list-none p-0 m-0 space-y-1.5 text-[1.05em]">
          {posts.length === 0 ? (
            <li className="text-[color:var(--text-muted-color)]">No posts yet.</li>
          ) : (
            posts.map((post) => (
              <li key={post._id}>
                <Link
                  href={post.url}
                  className="text-[color:var(--text-color)] hover:text-[color:var(--link-color)] hover:underline no-underline"
                >
                  {post.title}
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
