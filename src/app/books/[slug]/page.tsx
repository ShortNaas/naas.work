import { notFound } from "next/navigation";
import Link from "next/link";
import { client } from "@/lib/sanity/client";
import { bookBySlugQuery, bookSlugsQuery } from "@/lib/sanity/queries";
import type { Book } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";
import { PortableText } from "@/components/portable-text";

async function getBook(slug: string): Promise<Book | null> {
  return client.fetch<Book | null>(bookBySlugQuery, { slug });
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(bookSlugsQuery);
  return (slugs ?? []).map((slug) => ({ slug }));
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBook(slug);

  if (!book) {
    notFound();
  }

  const displayTitle = book.author
    ? `${book.title} - By ${book.author}`
    : book.title;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <article className="flex flex-col sm:flex-row gap-8 items-start">
        <div className="shrink-0 pt-10 sm:pt-16">
          {book.cover ? (
            <img
              src={urlFor(book.cover).width(120).height(160).url()}
              alt={`${book.title} book cover`}
              className="w-[120px] h-[160px] object-cover shadow-lg rounded bg-[var(--sidebar-bg)]"
            />
          ) : (
            <div className="w-[120px] h-[160px] bg-[var(--sidebar-bg)] rounded flex items-center justify-center text-[color:var(--text-muted-color)] text-xs">
              No cover
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-[#1e40af] dark:text-blue-400 mb-2">
            {displayTitle}
          </h1>
          {book.isbn && (
            <div className="text-sm text-[color:var(--text-muted-color)] tracking-wide">
              ISBN: {book.isbn}
            </div>
          )}
          {book.dateRead && (
            <div className="text-sm text-[color:var(--text-muted-color)] tracking-wide">
              DATE READ: {book.dateRead}
            </div>
          )}
          {book.rating != null && (
            <div className="text-sm text-[color:var(--text-muted-color)] tracking-wide">
              HOW STRONGLY I RECOMMEND IT: {book.rating}/5
            </div>
          )}
          <div className="mt-2 text-sm text-[color:var(--text-muted-color)]">
            (See{" "}
            <Link href="/books" className="text-[color:var(--link-color)] underline hover:no-underline">
              my list of books
            </Link>
            , for more.)
          </div>
          {book.amazonUrl && (
            <div className="mt-2 text-sm">
              <strong>
                Go to the{" "}
                <a
                  href={book.amazonUrl}
                  className="text-[color:var(--link-color)] underline hover:no-underline"
                >
                  Amazon page
                </a>{" "}
                for details and reviews.
              </strong>
            </div>
          )}
        </div>
      </article>

      {Array.isArray(book.body) && book.body.length > 0 ? (
        <div className="mt-6 text-[1.05em]">
          <PortableText value={book.body} />
        </div>
      ) : book.summary ? (
        <p className="mt-6 text-[color:var(--text-color)]">{book.summary}</p>
      ) : null}
    </div>
  );
}
