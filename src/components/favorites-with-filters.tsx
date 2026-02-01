"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Favorite, FavoriteCategory } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

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

export function FavoritesWithFilters({ favorites }: { favorites: Favorite[] }) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());

  const uniqueCategories = useMemo(() => getUniqueCategories(favorites), [favorites]);
  const filteredFavorites = useMemo(
    () => filterFavorites(favorites, selectedCategoryIds),
    [favorites, selectedCategoryIds]
  );

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

  return (
    <>
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
        <ul className="grid gap-6 list-none p-0 m-0 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFavorites.map((item) => (
            <li key={item._id}>
              <article className="h-full rounded-lg bg-[var(--sidebar-bg)] shadow-[var(--card-shadow)] overflow-hidden transition-shadow hover:shadow-lg flex flex-col">
                {item.image && (
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--main-border-color)]">
                    <img
                      src={urlFor(item.image).width(400).height(300).url()}
                      alt=""
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  {item.category && (
                    <span className="text-xs uppercase tracking-wide text-[color:var(--text-muted-color)]">
                      {item.category.title}
                    </span>
                  )}
                  <h2 className="mt-1 text-lg font-semibold text-[color:var(--heading-color)]">
                    {item.link ? (
                      <Link
                        href={item.link}
                        className="text-[color:var(--link-color)] hover:underline"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      item.name
                    )}
                  </h2>
                  {item.description && (
                    <p className="mt-2 text-sm text-[color:var(--text-color)] line-clamp-3 flex-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
