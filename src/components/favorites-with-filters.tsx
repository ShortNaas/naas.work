"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDateYYYYMMDD } from "@/lib/format-date";
import type { Favorite, FavoriteCategory } from "@/lib/sanity/types";
import { PortableText } from "@/components/portable-text";

/** Hashtag form of a label: "Open Source" -> "#opensource". */
function toHashtag(title: string): string {
  return `#${title.toLowerCase().replace(/[^a-z0-9]+/g, "")}`;
}

function getUniqueCategories(favorites: Favorite[]): FavoriteCategory[] {
  const seen = new Set<string>();
  const categories: FavoriteCategory[] = [];
  for (const f of favorites) {
    if (!f.category) continue;
    if (!seen.has(f.category._id)) {
      seen.add(f.category._id);
      categories.push(f.category);
    }
  }
  return categories.sort((a, b) => a.title.localeCompare(b.title));
}

function filterFavorites(favorites: Favorite[], selectedCategoryIds: Set<string>): Favorite[] {
  if (selectedCategoryIds.size === 0) return favorites;
  return favorites.filter(
    (f) => f.category && selectedCategoryIds.has(f.category._id)
  );
}

function groupByCategorySorted(favorites: Favorite[]): { category: FavoriteCategory | null; items: Favorite[] }[] {
  const withCategory = favorites.filter((f) => f.category);
  const withoutCategory = favorites.filter((f) => !f.category);
  const byId = new Map<string, Favorite[]>();
  for (const f of withCategory) {
    const c = f.category!;
    if (!byId.has(c._id)) byId.set(c._id, []);
    byId.get(c._id)!.push(f);
  }
  const categoryTitles = Array.from(byId.keys())
    .map((id) => {
      const items = byId.get(id)!;
      return { category: items[0].category!, items };
    })
    .sort((a, b) => a.category.title.localeCompare(b.category.title));
  const groups: { category: FavoriteCategory | null; items: Favorite[] }[] = categoryTitles.map(
    (g) => ({ category: g.category, items: g.items })
  );
  if (withoutCategory.length > 0) {
    groups.push({ category: null, items: withoutCategory });
  }
  return groups;
}

export function FavoritesWithFilters({ favorites }: { favorites: Favorite[] }) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());

  const uniqueCategories = useMemo(() => getUniqueCategories(favorites), [favorites]);
  const filteredFavorites = useMemo(
    () => filterFavorites(favorites, selectedCategoryIds),
    [favorites, selectedCategoryIds]
  );
  const groups = useMemo(() => groupByCategorySorted(filteredFavorites), [filteredFavorites]);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (favorites.length === 0) {
    return (
      <p className="text-sm text-[color:var(--text-muted-color)]">No favorites yet.</p>
    );
  }

  const linkClass = "text-[color:var(--link-color)] hover:underline font-semibold";
  const latestUpdatedAt = favorites
    .map((f) => f._updatedAt)
    .filter(Boolean)
    .sort()
    .pop();

  return (
    <>
      <p className="mb-3 text-[color:var(--text-muted-color)]" style={{ fontSize: "1.0625rem" }}>
        <Link href="/contact" className="text-[color:var(--link-color)] hover:underline">
          Email me with any suggestions
        </Link>
        {latestUpdatedAt ? ` – Last update: ${formatDateYYYYMMDD(latestUpdatedAt)}` : ""}
      </p>
      {uniqueCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {uniqueCategories.map((c) => {
            const isSelected = selectedCategoryIds.has(c._id);
            return (
              <button
                key={c._id}
                type="button"
                onClick={() => toggleCategory(c._id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wide transition-colors
                  ${isSelected
                    ? "bg-[var(--link-color)] text-white"
                    : "bg-[var(--sidebar-bg)] text-[color:var(--text-muted-color)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[color:var(--heading-color)]"
                  }`}
              >
                {c.title}
              </button>
            );
          })}
        </div>
      )}
      {filteredFavorites.length === 0 ? (
        <p className="text-sm text-[color:var(--text-muted-color)]">
          No favorites match the selected filter.
        </p>
      ) : (
        <div className="space-y-8">
          {groups.map(({ category, items }) => (
            <section key={category?._id ?? "uncategorized"}>
              <div className="border-b border-[var(--main-border-color)] pb-1.5 mb-3">
                <div className="text-xs font-medium uppercase tracking-wide text-[color:var(--text-muted-color)]" style={{ fontSize: "1.0rem" }}>
                  {category ? category.title : "Other"}
                </div>
              </div>
              <ul className="list-none p-0 m-0 space-y-6">
                {items.map((item) => (
                  <li key={item._id}>
                    <div className="min-w-0">
                      {/* Name and category share one line, comma-separated. */}
                      <div className="flex flex-wrap items-baseline gap-x-1.5">
                        {item.link ? (
                          <Link href={item.link} className={`text-lg ${linkClass}`}>
                            {item.name}
                          </Link>
                        ) : (
                          <span className="text-lg font-semibold text-[color:var(--heading-color)]">
                            {item.name}
                          </span>
                        )}
                        {category && (
                          <span className="flex items-baseline gap-x-1.5 text-sm">
                            <span
                              aria-hidden
                              className="text-[color:var(--text-muted-color)]"
                            >
                              ,
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleCategory(category._id)}
                              aria-pressed={selectedCategoryIds.has(category._id)}
                              className={`cursor-pointer transition-colors ${
                                selectedCategoryIds.has(category._id)
                                  ? "text-[color:var(--link-color)] font-semibold"
                                  : "text-[color:var(--text-muted-color)] hover:text-[color:var(--heading-color)]"
                              }`}
                            >
                              {toHashtag(category.title)}
                            </button>
                          </span>
                        )}
                      </div>
                      {item.description && Array.isArray(item.description) && item.description.length > 0 && (
                        <div className="mt-2 text-sm text-[color:var(--text-color)] [&_a]:text-[color:var(--link-color)] [&_a]:hover:underline [&_p]:mb-0">
                          <PortableText value={item.description} />
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
