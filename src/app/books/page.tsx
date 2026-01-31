import { client } from "@/lib/sanity/client";
import { booksQuery } from "@/lib/sanity/queries";
import type { Book } from "@/lib/sanity/types";
import { BooksList } from "@/components/books-list";

async function getBooks(): Promise<Book[]> {
  const books = await client.fetch<Book[]>(booksQuery);
  return books ?? [];
}

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-[color:var(--heading-color)] mb-8">
        Book Notes
      </h1>
      <BooksList books={books} />
    </div>
  );
}
