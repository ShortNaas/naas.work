"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Records a page view by calling POST /api/view. Runs once per path when mounted. */
export function ViewCounter() {
  const pathname = usePathname();
  const sent = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!pathname || sent.current.has(pathname)) return;
    sent.current.add(pathname);

    fetch("/api/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
