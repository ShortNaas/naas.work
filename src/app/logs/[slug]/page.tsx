import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/lib/sanity/client";
import { logsBySlugQuery, logsSlugsQuery } from "@/lib/sanity/queries";
import type { Logs } from "@/lib/sanity/types";
import Link from "next/link";
import { formatDateYYYYMMDD } from "@/lib/format-date";

async function getlogs(slug: string): Promise<Logs | null> {
  const logs = await client.fetch<Logs | null>(logsBySlugQuery, {
    slug,
  });
  return logs;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const logs = await getlogs(slug);
  if (!logs) return { title: "Log not found" };
  return { title: logs.title, description: logs.description };
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(logsSlugsQuery);
  return (slugs ?? []).map((slug) => ({ slug }));
}

export default async function LogsCollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const logs = await getlogs(slug);

  if (!logs) {
    notFound();
  }

  const entries = logs.entries ?? [];

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-[color:var(--heading-color)] mb-8">
        {logs.title}
      </h1>

      {logs.description && (
        <p className="text-sm text-[color:var(--text-muted-color)] mb-2">
          {logs.description}
        </p>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-[color:var(--text-muted-color)]">
          No entries yet.
        </p>
      ) : (
        <ul className="list-none p-0 m-0 space-y-2">
          {entries.map((entry) => (
            <li key={entry._id}>
              <Link
                href={`/logs/${logs.slug.current}/${entry.slug.current}`}
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
