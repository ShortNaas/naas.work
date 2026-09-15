import { notFound } from "next/navigation";
import { client } from "@/lib/sanity/client";
import { postBySlugQuery, postSlugsQuery } from "@/lib/sanity/queries";
import type { Post } from "@/lib/sanity/types";
import { getTocFromBody } from "@/lib/toc";
import { PostPageClient } from "@/components/post-page-client";
import { CommentSection } from "@/components/comment-section";

async function getPost(slug: string): Promise<Post | null> {
  const post = await client.fetch<Post | null>(postBySlugQuery, { slug });
  return post;
}

/**
 * Post pages are static, and the comment list is read at render time. Approving
 * a comment revalidates its post immediately; this hourly fallback covers the
 * case where that revalidation never fires (or the database was unreachable
 * during a build), so a page cannot be stuck with an empty comment list.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(postSlugsQuery);
  return (slugs ?? []).map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const toc = getTocFromBody(post.body ?? []);

  return (
    <div className="max-w-3xl mx-auto">
      <PostPageClient post={post} toc={toc} />
      <CommentSection postSlug={`/blog/${slug}`} />
    </div>
  );
}
