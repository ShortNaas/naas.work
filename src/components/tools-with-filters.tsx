"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Tool, ToolCategory } from "@/lib/sanity/types";

function formatUpdatedAt(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
                      {item.link ? (
                        <Link href={item.link} className={`block text-lg ${linkClass}`}>
                          {item.name}
                        </Link>
                      ) : (
                        <span className="block text-lg font-semibold text-[color:var(--heading-color)]">
                          {item.name}
                        </span>
                      )}
                      {item.category && (
                        <span className="mt-0.5 block text-xs uppercase tracking-wide text-[color:var(--text-muted-color)]">
                          {item.category.title}
                        </span>
                      )}
                      {item.description && (
                        <p className="mt-2 text-sm text-[color:var(--text-color)]">
                          {item.description}
                        </p>
                      )}
                      <p className="mt-1.5 text-[color:var(--text-muted-color)]" style={{ fontSize: "0.75rem" }}>
                        <Link href="/contact" className="text-[color:var(--link-color)] hover:underline">
                          Email me with any suggestions
                        </Link>
                      </p>
                      {item._updatedAt && (
                        <p className="mt-0.5 text-[color:var(--text-muted-color)]" style={{ fontSize: "0.75rem" }}>
                          Last update: {formatUpdatedAt(item._updatedAt)}
                        </p>
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
