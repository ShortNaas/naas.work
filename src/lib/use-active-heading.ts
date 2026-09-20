"use client";

import { useEffect, useState } from "react";

const NONE = -1;

/**
 * Tracks which heading is currently in view, for a table of contents.
 *
 * Returns the index into `ids` of the heading the reader is looking at, or -1
 * when none is in view. Deliberately uses IntersectionObserver rather than
 * scroll listeners so it never reads layout on the scroll path.
 *
 * State is only written from the observer callback, never synchronously in the
 * effect body, to avoid cascading renders.
 */
export function useActiveHeading(ids: string[]): number {
  const [activeIndex, setActiveIndex] = useState<number>(NONE);

  // Join into a primitive so the effect does not re-subscribe on every render:
  // a new array identity would restart the observer each time.
  const key = ids.join("|");

  useEffect(() => {
    const list = key ? key.split("|") : [];
    if (list.length === 0) return;

    const elements = list
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    // Which headings are currently intersecting, keyed by id.
    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }

        // Pick the topmost visible heading so the highlight follows the reader.
        const next = list.findIndex((id) => visible.has(id));
        setActiveIndex(next);
      },
      {
        // A heading counts as current once it reaches the upper third of the
        // viewport, with room for the sticky top bar.
        rootMargin: "-80px 0px -66% 0px",
        threshold: 0,
      }
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [key]);

  return activeIndex;
}
