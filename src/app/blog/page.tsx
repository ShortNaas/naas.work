import Link from "next/link";
import { client } from "@/lib/sanity/client";
import { postsQuery } from "@/lib/sanity/queries";
import type { Post } from "@/lib/sanity/types";

async function getPosts(): Promise<Post[]> {
  const posts = await client.fetch<Post[]>(postsQuery);
  return posts ?? [];
}

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-[color:var(--heading-color)] mb-6">
        Blog
      </h1>
      {posts.length === 0 ? (
        <p className="text-sm text-[color:var(--text-muted-color)]">No posts yet.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 list-none p-0 m-0">
          {posts.map((post) => (
            <li key={post._id}>
              <article className="rounded-lg bg-[var(--sidebar-bg)] shadow-[var(--card-shadow)] overflow-hidden transition-shadow hover:shadow-lg h-full flex flex-col">
                <Link
                  href={`/blog/${post.slug.current}`}
                  className="block no-underline group p-3"
                >
                  <span className="font-semibold text-[color:var(--heading-color)] group-hover:text-[color:var(--link-color)] transition-colors" style={{ fontSize: "0.875rem" }}>
                    {post.title}
                  </span>
                  <span className="text-[color:var(--text-muted-color)]" style={{ fontSize: "0.75rem" }}> – </span>
                  <time
                    dateTime={post.publishedAt}
                    className="text-xs text-[color:var(--text-muted-color)]"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {formatDate(post.publishedAt)}
                  </time>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
