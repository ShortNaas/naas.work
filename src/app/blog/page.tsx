import Link from "next/link";
import { client } from "@/lib/sanity/client";
import { formatDateYYYYMMDD } from "@/lib/format-date";
import { postsQuery } from "@/lib/sanity/queries";
import type { Post } from "@/lib/sanity/types";

async function getPosts(): Promise<Post[]> {
  const posts = await client.fetch<Post[]>(postsQuery);
  return posts ?? [];
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
        <ul className="list-none p-0 m-0 space-y-2">
          {posts.map((post) => (
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
      )}
    </div>
  );
}
