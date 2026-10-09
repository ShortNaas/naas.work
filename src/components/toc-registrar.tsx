"use client";

import { useEffect } from "react";
import { useToc } from "@/contexts/toc-context";
import type { TocItem } from "@/lib/toc";

/**
 * Publishes the article's headings to the right panel and renders nothing.
 * Isolating it keeps the article itself a server component.
 */
export function TocRegistrar({ toc }: { toc: TocItem[] }) {
  const { setToc } = useToc();

  useEffect(() => {
    setToc(toc);
    return () => setToc(null);
  }, [toc, setToc]);

  return null;
}
