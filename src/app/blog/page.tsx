import { client } from "@/lib/sanity/client";
import { getViewCounts } from "@/lib/views";
import { postsQuery } from "@/lib/sanity/queries";
import type { Post } from "@/lib/sanity/types";
import { BlogList } from "@/components/blog-list";

async function getPosts(): Promise<Post[]> {
  const posts = await client.fetch<Post[]>(postsQuery);
  return posts ?? [];
}

export default async function BlogPage() {
  const [posts, viewCounts] = await Promise.all([
    getPosts(),
    getViewCounts(),
  ]);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-[color:var(--heading-color)] mb-6">
        Blog
      </h1>
      <BlogList posts={posts} viewCounts={viewCounts} />
    </div>
  );
}
