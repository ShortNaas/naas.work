"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Book } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

type SortBy = "title" | "best" | "date";

function sortBooks(books: Book[], sortBy: SortBy): Book[] {
  const sorted = [...books];
  if (sortBy === "title") {
    sorted.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
  } else if (sortBy === "best") {
    sorted.sort((a, b) => {
      const r = (b.rating ?? 0) - (a.rating ?? 0);
      return r !== 0 ? r : (a.title ?? "").localeCompare(b.title ?? "");
    });
  } else {
    sorted.sort((a, b) => {
      const da = a.dateRead ? new Date(a.dateRead).getTime() : 0;
      const db = b.dateRead ? new Date(b.dateRead).getTime() : 0;
      return db - da;
    });
  }
  return sorted;
}

export function BooksList({ books }: { books: Book[] }) {
  const [sortBy, setSortBy] = useState<SortBy>("title");

  const sortedBooks = useMemo(() => sortBooks(books, sortBy), [books, sortBy]);

  if (books.length === 0) {
    return (
      <p className="text-sm text-[color:var(--text-muted-color)]">No books yet.</p>
    );
  }

  const linkClass = "text-[color:var(--link-color)] hover:underline font-semibold";
  const sortBtn = (key: SortBy, label: string) => (
    <button
      type="button"
      onClick={() => setSortBy(key)}
      className={`cursor-pointer mr-3 text-sm transition-colors ${sortBy === key ? "text-[color:var(--link-color)]" : "text-[color:var(--text-muted-color)] hover:text-[color:var(--heading-color)]"}`}
    >
      {label}
    </button>
  );

  return (
    <>
      <div className="mb-5 text-sm text-[color:var(--text-muted-color)]">
        Sort by: {sortBtn("title", "title")}
        {sortBtn("best", "best")}
        {sortBtn("date", "date")}
      </div>
      <ul className="list-none p-0 m-0 space-y-8">
        {sortedBooks.map((book) => (
          <li key={book._id} className="flex items-start gap-6">
            <Link href={`/books/${book.slug.current}`} className="shrink-0">
              {book.cover ? (
                <img
                  src={urlFor(book.cover).width(92).height(120).url()}
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
                {book.dateRead && `Date Read: ${book.dateRead}. `}
                {book.rating != null && `How Strongly I Recommend It: ${book.rating}/10`}
              </div>
              {book.summary && (
                <p className="mt-2 text-sm text-[color:var(--text-color)]">
                  {book.summary}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
