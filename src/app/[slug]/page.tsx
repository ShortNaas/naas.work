import { notFound } from "next/navigation";
import { client } from "@/lib/sanity/client";
import { pageBySlugQuery, pageSlugsQuery } from "@/lib/sanity/queries";
import type { Page } from "@/lib/sanity/types";
import { PortableText } from "@/components/portable-text";

const RESERVED_SLUGS = new Set([
  "admin",
  "blog",
  "books",
  "projects",
  "favorite",
  "tools",
  "about",
  "contact",
  "studio",
  "api",
]);

async function getPage(slug: string): Promise<Page | null> {
  return client.fetch<Page | null>(pageBySlugQuery, { slug });
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

  if (RESERVED_SLUGS.has(slug)) {
    notFound();
  }

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
