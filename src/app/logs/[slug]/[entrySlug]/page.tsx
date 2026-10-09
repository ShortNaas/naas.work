import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/lib/sanity/client";
import {
  logsEntryBySlugQuery,
  logsEntrySlugsQuery,
} from "@/lib/sanity/queries";
import type { LogsEntry } from "@/lib/sanity/types";
import { getTocFromBody } from "@/lib/toc";
import { metaDescription } from "@/lib/portable-text";
import { Article } from "@/components/article";

interface LogsEntrySlugsResult {
  logsSlug: string;
  entries: Array<{ entrySlug: string } | null> | null;
}

async function getEntry(entrySlug: string): Promise<LogsEntry | null> {
  const entry = await client.fetch<LogsEntry | null>(
    logsEntryBySlugQuery,
    { entrySlug },
  );
  return entry;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; entrySlug: string }>;
}): Promise<Metadata> {
  const { entrySlug } = await params;
  const entry = await getEntry(entrySlug);
  if (!entry) return { title: "Entry not found" };
  return { title: entry.title, description: metaDescription(entry.body) };
}

export async function generateStaticParams() {
  const results = await client.fetch<LogsEntrySlugsResult[]>(
    logsEntrySlugsQuery,
  );

  const params: { slug: string; entrySlug: string }[] = [];

  for (const logs of results ?? []) {
    for (const entry of logs.entries ?? []) {
      if (entry?.entrySlug) {
        params.push({
          slug: logs.logsSlug,
          entrySlug: entry.entrySlug,
        });
      }
    }
  }

  return params;
}

export default async function LogsEntryPage({
  params,
}: {
  params: Promise<{ slug: string; entrySlug: string }>;
}) {
  const { slug, entrySlug } = await params;
  const entry = await getEntry(entrySlug);

  if (!entry) {
    notFound();
  }

  // The query scopes to the entry slug alone, so make sure the collection in
  // the URL is actually the one this entry belongs to. Without this the same
  // entry is served at /logs/<anything>/<entrySlug>.
  if (entry.logs?.slug.current !== slug) {
    notFound();
  }

  const toc = getTocFromBody(entry.body ?? []);

  // Build a post-compatible shape so we can reuse Article
  const postShape = {
    _id: entry._id,
    title: entry.title,
    slug: entry.slug,
    publishedAt: entry.publishedAt ?? "",
    coverImage: entry.coverImage,
    body: entry.body,
  };

  return (
    <Article
      post={postShape}
      toc={toc}
      backLink={{
        href: `/logs/${slug}`,
        label: `← Back to ${entry.logs?.title ?? "collection"}`,
      }}
    />
  );
}
