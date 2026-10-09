"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDateYYYYMMDD } from "@/lib/format-date";
import {
  groupByCategory,
  toHashtag,
  uniqueCategories,
  type CategorizedItem,
} from "@/lib/category-groups";
import { PortableText } from "@/components/portable-text";

/** A categorised list with hashtag filters. Used by /uses and /favorite. */
export function CategoryList({
  items,
  noun,
}: {
  items: CategorizedItem[];
  /** Plural, lowercase: "tools", "favorites". */
  noun: string;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const categories = useMemo(() => uniqueCategories(items), [items]);
  const visible = useMemo(
    () =>
      selectedIds.size === 0
        ? items
        : items.filter((i) => i.category && selectedIds.has(i.category._id)),
    [items, selectedIds]
  );
  const groups = useMemo(() => groupByCategory(visible), [visible]);

  const toggle = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  if (items.length === 0) {
    return (
      <p className="text-sm text-[color:var(--text-muted-color)]">No {noun} yet.</p>
    );
  }

  const linkClass = "text-[color:var(--link-color)] hover:underline font-semibold";
  const lastUpdated = items.map((i) => i._updatedAt).filter(Boolean).sort().pop();

  return (
    <>
      <p className="mb-3 text-[color:var(--text-muted-color)]" style={{ fontSize: "1.0625rem" }}>
        <Link href="/contact" className="text-[color:var(--link-color)] hover:underline">
          Email me with any suggestions
        </Link>
        {lastUpdated ? ` – Last update: ${formatDateYYYYMMDD(lastUpdated)}` : ""}
      </p>

      {categories.length > 0 && (
        <div
          role="group"
          aria-label={`Filter ${noun} by tag`}
          className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-8"
        >
          {categories.map((c) => {
            const isSelected = selectedIds.has(c._id);
            return (
              <button
                key={c._id}
                type="button"
                onClick={() => toggle(c._id)}
                aria-pressed={isSelected}
                className={`cursor-pointer text-sm transition-colors ${
                  isSelected
                    ? "text-[color:var(--link-color)] font-semibold"
                    : "text-[color:var(--text-muted-color)] hover:text-[color:var(--heading-color)]"
                }`}
              >
                {toHashtag(c.title)}
              </button>
            );
          })}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="text-sm text-[color:var(--text-muted-color)]">
          No {noun} match the selected filter.
        </p>
      ) : (
        <div className="space-y-8">
          {groups.map(({ category, items: groupItems }) => (
            <section key={category?._id ?? "uncategorized"}>
              <div className="border-b border-[var(--main-border-color)] pb-1.5 mb-3">
                <div className="text-xs font-medium uppercase tracking-wide text-[color:var(--text-muted-color)]">
                  {category ? category.title : "Other"}
                </div>
              </div>
              <ul className="list-none p-0 m-0 space-y-6">
                {groupItems.map((item) => (
                  <li key={item._id}>
                    {/* Name and category share one line, comma-separated. */}
                    <div className="flex flex-wrap items-baseline gap-x-1.5">
                      {item.link ? (
                        <Link href={item.link} prefetch className={`text-lg ${linkClass}`}>
                          {item.name}
                        </Link>
                      ) : (
                        <span className="text-lg font-semibold text-[color:var(--heading-color)]">
                          {item.name}
                        </span>
                      )}
                      {category && (
                        <span className="flex items-baseline gap-x-1.5 text-sm">
                          <span aria-hidden className="text-[color:var(--text-muted-color)]">
                            ,
                          </span>
                          <button
                            type="button"
                            onClick={() => toggle(category._id)}
                            aria-pressed={selectedIds.has(category._id)}
                            className={`cursor-pointer transition-colors ${
                              selectedIds.has(category._id)
                                ? "text-[color:var(--link-color)] font-semibold"
                                : "text-[color:var(--text-muted-color)] hover:text-[color:var(--heading-color)]"
                            }`}
                          >
                            {toHashtag(category.title)}
                          </button>
                        </span>
                      )}
                    </div>
                    {item.description &&
                      Array.isArray(item.description) &&
                      item.description.length > 0 && (
                        <div className="mt-2 text-sm text-[color:var(--text-color)] [&_a]:text-[color:var(--link-color)] [&_a]:hover:underline [&_p]:mb-0">
                          <PortableText value={item.description} size="inline" />
                        </div>
                      )}
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
