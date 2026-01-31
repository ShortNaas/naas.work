"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { TocItem } from "@/lib/toc";

type TocContextValue = {
  toc: TocItem[] | null;
  setToc: (toc: TocItem[] | null) => void;
};

const TocContext = createContext<TocContextValue | null>(null);

export function TocProvider({ children }: { children: ReactNode }) {
  const [toc, setToc] = useState<TocItem[] | null>(null);
  const value: TocContextValue = { toc, setToc: useCallback((t) => setToc(t), []) };
  return <TocContext.Provider value={value}>{children}</TocContext.Provider>;
}

export function useToc() {
  const ctx = useContext(TocContext);
  return ctx ?? { toc: null, setToc: () => {} };
}
