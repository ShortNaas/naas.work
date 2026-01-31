import { notFound } from "next/navigation";
import { client } from "@/lib/sanity/client";
import { postBySlugQuery, postSlugsQuery } from "@/lib/sanity/queries";
import type { Post } from "@/lib/sanity/types";
import { getTocFromBody } from "@/lib/toc";
import { PostPageClient } from "@/components/post-page-client";

async function getPost(slug: string): Promise<Post | null> {
  const post = await client.fetch<Post | null>(postBySlugQuery, { slug });
  return post;
}

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

  return <PostPageClient post={post} toc={toc} />;
}
