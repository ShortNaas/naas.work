"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDateYYYYMMDD } from "@/lib/format-date";
import type { Tool, ToolCategory } from "@/lib/sanity/types";
import { PortableText } from "@/components/portable-text";

/** Hashtag form of a label: "Open Source" -> "#opensource". */
function toHashtag(title: string): string {
  return `#${title.toLowerCase().replace(/[^a-z0-9]+/g, "")}`;
}

function getUniqueCategories(tools: Tool[]): ToolCategory[] {
  const seen = new Set<string>();
  const categories: ToolCategory[] = [];
  for (const t of tools) {
    if (!t.category) continue;
    if (!seen.has(t.category._id)) {
      seen.add(t.category._id);
      categories.push(t.category);
    }
  }
  return categories.sort((a, b) => a.title.localeCompare(b.title));
}

function filterTools(tools: Tool[], selectedCategoryIds: Set<string>): Tool[] {
  if (selectedCategoryIds.size === 0) return tools;
  return tools.filter(
    (t) => t.category && selectedCategoryIds.has(t.category._id)
  );
}

function groupByCategorySorted(tools: Tool[]): { category: ToolCategory | null; items: Tool[] }[] {
  const withCategory = tools.filter((t) => t.category);
  const withoutCategory = tools.filter((t) => !t.category);
  const byId = new Map<string, Tool[]>();
  for (const t of withCategory) {
    const c = t.category!;
    if (!byId.has(c._id)) byId.set(c._id, []);
    byId.get(c._id)!.push(t);
  }
  const categoryTitles = Array.from(byId.keys())
    .map((id) => {
      const items = byId.get(id)!;
      return { category: items[0].category!, items };
    })
    .sort((a, b) => a.category.title.localeCompare(b.category.title));
  const groups: { category: ToolCategory | null; items: Tool[] }[] = categoryTitles.map(
    (g) => ({ category: g.category, items: g.items })
  );
  if (withoutCategory.length > 0) {
    groups.push({ category: null, items: withoutCategory });
  }
  return groups;
}

export function ToolsWithFilters({ tools }: { tools: Tool[] }) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());

  const uniqueCategories = useMemo(() => getUniqueCategories(tools), [tools]);
  const filteredTools = useMemo(
    () => filterTools(tools, selectedCategoryIds),
    [tools, selectedCategoryIds]
  );
  const groups = useMemo(() => groupByCategorySorted(filteredTools), [filteredTools]);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (tools.length === 0) {
    return (
      <p className="text-sm text-[color:var(--text-muted-color)]">No tools yet.</p>
    );
  }

  const linkClass = "text-[color:var(--link-color)] hover:underline font-semibold";
  const latestUpdatedAt = tools
    .map((t) => t._updatedAt)
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
        <div
          role="group"
          aria-label="Filter tools by tag"
          className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-8"
        >
          {uniqueCategories.map((c) => {
            const isSelected = selectedCategoryIds.has(c._id);
            return (
              <button
                key={c._id}
                type="button"
                onClick={() => toggleCategory(c._id)}
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
      {filteredTools.length === 0 ? (
        <p className="text-sm text-[color:var(--text-muted-color)]">
          No tools match the selected filter.
        </p>
      ) : (
        <div className="space-y-8">
          {groups.map(({ category, items }) => (
            <section key={category?._id ?? "uncategorized"}>
              <div className="border-b border-[var(--main-border-color)] pb-1.5 mb-3">
                <div className="text-xs font-medium uppercase tracking-wide text-[color:var(--text-muted-color)]" style={{ fontSize: "0.75rem" }}>
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
                          <Link
                            href={item.link}
                            prefetch
                            className={`text-lg ${linkClass}`}
                          >
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
                          <PortableText value={item.description} size="inline" />
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
