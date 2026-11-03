import type { PortableTextBlock } from "@portabletext/types";

type Category = { _id: string; title: string };

/** Shape shared by favorites and tools: a named, linkable, categorised thing. */
export type CategorizedItem = {
  _id: string;
  name: string;
  description?: PortableTextBlock[];
  link?: string;
  _updatedAt?: string;
  category?: Category | null;
  /** Tools only: kept on the page, struck through and last in its category. */
  archived?: boolean;
  /** Tools only: why I stopped using it. Only rendered while `archived`. */
  archivedNote?: string;
};

/** Hashtag form of a label: "Open Source" -> "#opensource". */
export function toHashtag(title: string): string {
  return `#${title.toLowerCase().replace(/[^a-z0-9]+/g, "")}`;
}

/** Distinct categories, by title. */
export function uniqueCategories(items: CategorizedItem[]): Category[] {
  const seen = new Set<string>();
  const out: Category[] = [];
  for (const item of items) {
    if (!item.category || seen.has(item.category._id)) continue;
    seen.add(item.category._id);
    out.push(item.category);
  }
  return out.sort((a, b) => a.title.localeCompare(b.title));
}

/** One group per category, sorted by title, uncategorised last. */
export function groupByCategory(
  items: CategorizedItem[]
): { category: Category | null; items: CategorizedItem[] }[] {
  const grouped = Map.groupBy(
    items,
    (item) => item.category?._id ?? "uncategorized"
  );
  return Array.from(grouped.values(), (groupItems) => ({
    category: groupItems[0]?.category ?? null,
    items: groupItems,
  })).sort((a, b) =>
    a.category
      ? b.category
        ? a.category.title.localeCompare(b.category.title)
        : -1
      : 1
  );
}
