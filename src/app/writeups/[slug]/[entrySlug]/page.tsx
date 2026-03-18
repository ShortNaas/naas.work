import { notFound } from "next/navigation";
import { client } from "@/lib/sanity/client";
import {
  writeupEntryBySlugQuery,
  writeupEntrySlugsQuery,
} from "@/lib/sanity/queries";
import type { WriteupEntry } from "@/lib/sanity/types";
import { getTocFromBody } from "@/lib/toc";
import { PostPageClient } from "@/components/post-page-client";

interface WriteupEntrySlugsResult {
  writeupSlug: string;
  entries: Array<{ entrySlug: string } | null> | null;
}

async function getEntry(entrySlug: string): Promise<WriteupEntry | null> {
  const entry = await client.fetch<WriteupEntry | null>(
    writeupEntryBySlugQuery,
    { entrySlug },
  );
  return entry;
}

export async function generateStaticParams() {
  const results = await client.fetch<WriteupEntrySlugsResult[]>(
    writeupEntrySlugsQuery,
  );

  const params: { slug: string; entrySlug: string }[] = [];

  for (const writeup of results ?? []) {
    for (const entry of writeup.entries ?? []) {
      if (entry?.entrySlug) {
        params.push({
          slug: writeup.writeupSlug,
          entrySlug: entry.entrySlug,
        });
      }
    }
  }

  return params;
}

export default async function WriteupEntryPage({
  params,
}: {
  params: Promise<{ slug: string; entrySlug: string }>;
}) {
  const { slug, entrySlug } = await params;
  const entry = await getEntry(entrySlug);

  if (!entry) {
    notFound();
  }

  const toc = getTocFromBody(entry.body ?? []);

  // Build a post-compatible shape so we can reuse PostPageClient
  const postShape = {
    _id: entry._id,
    title: entry.title,
    slug: entry.slug,
    publishedAt: entry.publishedAt ?? "",
    coverImage: entry.coverImage,
    body: entry.body,
  };

  return <PostPageClient post={postShape} toc={toc} />;
}
