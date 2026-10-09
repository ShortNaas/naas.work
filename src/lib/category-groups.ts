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
  const groups = new Map<
    string,
    { category: Category | null; items: CategorizedItem[] }
  >();
  for (const item of items) {
    const key = item.category?._id ?? "uncategorized";
    const group = groups.get(key) ?? { category: item.category ?? null, items: [] };
    group.items.push(item);
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) =>
    a.category
      ? b.category
        ? a.category.title.localeCompare(b.category.title)
        : -1
      : 1
  );
}
