"use client";

import { useState } from "react";

/**
 * Sort state for a list: click a column to sort by it, click again to flip.
 * Each column's intended first direction comes from `defaults`, so the list
 * opens in the direction that reads best (newest first, highest rated first).
 */
export function useSort<K extends string>(initial: K, defaults: Record<K, boolean>) {
  const [sortBy, setSortBy] = useState<K>(initial);
  const [sortAsc, setSortAsc] = useState(defaults[initial]);

  const toggle = (key: K) => {
    if (key === sortBy) {
      setSortAsc((a) => !a);
    } else {
      setSortBy(key);
      setSortAsc(defaults[key]);
    }
  };

  return { sortBy, sortAsc, toggle };
}

export function SortControls<K extends string>({
  options,
  sortBy,
  sortAsc,
  onToggle,
}: {
  options: { key: K; label: string }[];
  sortBy: K;
  sortAsc: boolean;
  onToggle: (key: K) => void;
}) {
  return (
    <div className="mb-5 text-sm text-[color:var(--text-muted-color)]">
      Sort by:{" "}
      {options.map(({ key, label }) => {
        const isActive = sortBy === key;
        const direction = isActive ? (sortAsc ? "ascending" : "descending") : null;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onToggle(key)}
            aria-label={
              direction ? `Sort by ${label}, currently ${direction}` : `Sort by ${label}`
            }
            className={`cursor-pointer mr-3 px-1 py-0.5 pointer-coarse:min-h-11 pointer-coarse:px-3 text-sm transition-colors ${isActive ? "text-[color:var(--link-color)]" : "text-[color:var(--text-muted-color)] hover:text-[color:var(--heading-color)]"}`}
          >
            {label}
            {isActive && (
              <span aria-hidden className="ml-1">
                {sortAsc ? "↑" : "↓"}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
