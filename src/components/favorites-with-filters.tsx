"use client";

import Link from "next/link";
import type { Favorite, FavoriteCategory } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

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
  if (favorites.length === 0) {
    return (
      <p className="text-sm text-[color:var(--text-muted-color)]">No favorites yet.</p>
    );
  }

  const groups = groupByCategorySorted(favorites);
  const linkClass = "text-[color:var(--link-color)] hover:underline font-semibold";

  return (
    <div className="space-y-8">
      {groups.map(({ category, items }) => (
        <section key={category?._id ?? "uncategorized"}>
          <div className="border-b border-[var(--main-border-color)] pb-2 mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--text-muted-color)]">
              {category ? category.title : "Other"}
            </h2>
          </div>
          <ul className="grid gap-6 list-none p-0 m-0 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li key={item._id} className="flex items-start gap-4">
                {item.image ? (
                  item.link ? (
                    <Link href={item.link} className="shrink-0">
                      <img
                        src={urlFor(item.image).width(80).height(105).url()}
                        alt=""
                        className="w-[80px] h-[105px] object-cover shadow-md rounded"
                      />
                    </Link>
                  ) : (
                    <img
                      src={urlFor(item.image).width(80).height(105).url()}
                      alt=""
                      className="w-[80px] h-[105px] object-cover shadow-md rounded shrink-0"
                    />
                  )
                ) : (
                  <div className="w-[80px] h-[105px] bg-[var(--sidebar-bg)] rounded flex items-center justify-center text-[color:var(--text-muted-color)] text-xs shrink-0">
                    No image
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  {item.link ? (
                    <Link href={item.link} className={`block text-base ${linkClass}`}>
                      {item.name}
                    </Link>
                  ) : (
                    <span className="block text-base font-semibold text-[color:var(--heading-color)]">
                      {item.name}
                    </span>
                  )}
                  {item.category && (
                    <span className="mt-0.5 block text-xs uppercase tracking-wide text-[color:var(--text-muted-color)]">
                      {item.category.title}
                    </span>
                  )}
                  {item.description && (
                    <p className="mt-1.5 text-sm text-[color:var(--text-color)] line-clamp-3">
                      {item.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
