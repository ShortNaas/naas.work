import { notFound } from "next/navigation";
import { client } from "@/lib/sanity/client";
import { writeupBySlugQuery, writeupSlugsQuery } from "@/lib/sanity/queries";
import type { Writeup } from "@/lib/sanity/types";
import Link from "next/link";
import { formatDateYYYYMMDD } from "@/lib/format-date";

async function getWriteup(slug: string): Promise<Writeup | null> {
  const writeup = await client.fetch<Writeup | null>(writeupBySlugQuery, {
    slug,
  });
  return writeup;
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(writeupSlugsQuery);
  return (slugs ?? []).map((slug) => ({ slug }));
}

export default async function WriteupCollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const writeup = await getWriteup(slug);

  if (!writeup) {
    notFound();
  }

  const entries = writeup.entries ?? [];

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-[color:var(--heading-color)] mb-2">
        {writeup.title}
      </h1>

      {writeup.description && (
        <p className="text-sm text-[color:var(--text-muted-color)] mb-8">
          {writeup.description}
        </p>
      )}

      {!writeup.description && <div className="mb-8" />}

      {entries.length === 0 ? (
        <p className="text-sm text-[color:var(--text-muted-color)]">
          No entries yet.
        </p>
      ) : (
        <ul className="list-none p-0 m-0 space-y-2">
          {entries.map((entry) => (
            <li key={entry._id}>
              <Link
                href={`/writeups/${writeup.slug.current}/${entry.slug.current}`}
                className="no-underline group flex flex-wrap items-baseline gap-x-1"
              >
                <span
                  className="font-semibold text-[color:var(--heading-color)] group-hover:text-[color:var(--link-color)] transition-colors"
                  style={{ fontSize: "1.05em" }}
                >
                  {entry.title}
                </span>
                {entry.publishedAt && (
                  <>
                    <span
                      className="text-[color:var(--text-muted-color)]"
                      style={{ fontSize: "1.05em" }}
                    >
                      –
                    </span>
                    <time
                      dateTime={entry.publishedAt}
                      className="text-[color:var(--text-muted-color)]"
                      style={{ fontSize: "1.05em" }}
                    >
                      {formatDateYYYYMMDD(entry.publishedAt)}
                    </time>
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
