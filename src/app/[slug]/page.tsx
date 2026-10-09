import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/lib/sanity/client";
import { pageBySlugQuery, pageSlugsQuery } from "@/lib/sanity/queries";
import type { Page } from "@/lib/sanity/types";
import { metaDescription } from "@/lib/portable-text";
import { PortableText } from "@/components/portable-text";

async function getPage(slug: string): Promise<Page | null> {
  return client.fetch<Page | null>(pageBySlugQuery, { slug });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return { title: page.title, description: metaDescription(page.body) };
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(pageSlugsQuery);
  return (slugs ?? []).map((slug) => ({ slug }));
}

export default async function CustomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Static routes (blog, about, api, rss.xml, …) already win over this dynamic
  // segment, so a conflicting Sanity page slug fails at build time, not here.
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-[color:var(--heading-color)] mb-6">
        {page.title}
      </h1>
      {Array.isArray(page.body) && page.body.length > 0 ? (
        <PortableText value={page.body} />
      ) : (
        <p className="text-[color:var(--text-muted-color)]">No content yet.</p>
      )}
    </div>
  );
}
