"use client";

import { useMemo } from "react";
import Link from "next/link";
import { formatDateYYYYMMDD } from "@/lib/format-date";
import type { Book } from "@/lib/sanity/types";
import { responsiveImage } from "@/lib/sanity/image";
import { PortableText } from "@/components/portable-text";
import { SortControls, useSort } from "@/components/sort-controls";

type SortBy = "date" | "title" | "best";

/** Comparators sort ascending; `asc` flips them (see blog-list). */
function sortBooks(books: Book[], sortBy: SortBy, asc: boolean): Book[] {
  const sorted = [...books];
  if (sortBy === "title") {
    sorted.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
  } else if (sortBy === "best") {
    sorted.sort((a, b) => {
      const r = (a.rating ?? 0) - (b.rating ?? 0);
      return r !== 0 ? r : (a.title ?? "").localeCompare(b.title ?? "");
    });
  } else {
    sorted.sort((a, b) => {
      const da = a.dateRead ? new Date(a.dateRead).getTime() : 0;
      const db = b.dateRead ? new Date(b.dateRead).getTime() : 0;
      return da - db;
    });
  }
  if (!asc) sorted.reverse();
  return sorted;
}

const defaultAsc: Record<SortBy, boolean> = {
  title: true,
  best: false,
  // Most recently read first is the default.
  date: false,
};

const sortOptions: { key: SortBy; label: string }[] = [
  { key: "date", label: "date" },
  { key: "title", label: "title" },
  { key: "best", label: "best" },
];

export function BooksList({ books }: { books: Book[] }) {
  const { sortBy, sortAsc, toggle } = useSort<SortBy>("date", defaultAsc);

  const sortedBooks = useMemo(
    () => sortBooks(books, sortBy, sortAsc),
    [books, sortBy, sortAsc]
  );

  if (books.length === 0) {
    return (
      <p className="text-sm text-[color:var(--text-muted-color)]">No books yet.</p>
    );
  }

  const linkClass = "text-[color:var(--link-color)] hover:underline font-semibold";

  return (
    <>
      <SortControls
        options={sortOptions}
        sortBy={sortBy}
        sortAsc={sortAsc}
        onToggle={toggle}
      />
      <ul className="list-none p-0 m-0 space-y-8">
        {sortedBooks.map((book) => (
          <li key={book._id} className="flex items-start gap-6">
            <Link href={`/books/${book.slug.current}`} className="shrink-0">
              {book.cover ? (
                // Deliberately a plain <img>: it points straight at Sanity's
                // resizing CDN with explicit dimensions and a srcSet, so there
                // is no need to route image bytes through an image proxy.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  {...responsiveImage(book.cover, { width: 92, height: 120 })}
                  sizes="92px"
                  loading="lazy"
                  decoding="async"
                  alt={`${book.title} book cover`}
                  className="w-[92px] h-[120px] object-cover shadow-md rounded"
                />
              ) : (
                <div className="w-[92px] h-[120px] bg-[var(--sidebar-bg)] rounded flex items-center justify-center text-[color:var(--text-muted-color)] text-xs">
                  No cover
                </div>
              )}
            </Link>
            <div className="min-w-0">
              <Link
                href={`/books/${book.slug.current}`}
                className={`block text-lg ${linkClass}`}
              >
                {book.author ? `${book.title} - By ${book.author}` : book.title}
              </Link>
              <div className="mt-1 text-sm text-[color:var(--text-muted-color)]">
                {book.dateRead && `Date Read: ${formatDateYYYYMMDD(book.dateRead)}. `}
                {book.rating != null && `How Strongly I Recommend It: ${book.rating}/5`}
              </div>
              {book.summary && Array.isArray(book.summary) && book.summary.length > 0 && (
                <div className="mt-2 text-sm text-[color:var(--text-color)] [&_a]:text-[color:var(--link-color)] [&_a]:hover:underline [&_p]:mb-0">
                  <PortableText value={book.summary} />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
