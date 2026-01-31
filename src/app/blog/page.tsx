import Link from "next/link";
import { client } from "@/lib/sanity/client";
import { postsQuery } from "@/lib/sanity/queries";
import type { Post } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

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
                  className="block no-underline group flex flex-col flex-1 min-h-0"
                >
                  {post.coverImage && (
                    <div className="aspect-video w-full overflow-hidden bg-[var(--main-border-color)] shrink-0">
                      <img
                        src={urlFor(post.coverImage).width(400).height(225).url()}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-3 flex-1 min-h-0">
                    <h2 className="text-base font-semibold text-[color:var(--heading-color)] group-hover:text-[color:var(--link-color)] transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <time
                      dateTime={post.publishedAt}
                      className="mt-1 block text-xs text-[color:var(--text-muted-color)]"
                    >
                      {formatDate(post.publishedAt)}
                    </time>
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
