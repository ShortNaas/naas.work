"use client";

import { usePathname } from "next/navigation";
import { MainLayout } from "./main-layout";
import type { LatestPost } from "./right-panel";

export function LayoutWrapper({
  children,
  latestPosts,
}: {
  children: React.ReactNode;
  latestPosts: LatestPost[];
}) {
  const pathname = usePathname();

  // Don't wrap Sanity Studio or other full-screen routes
  if (pathname?.startsWith("/studio") || pathname?.startsWith("/keep-going")) {
    return <>{children}</>;
  }

  return <MainLayout latestPosts={latestPosts}>{children}</MainLayout>;
}
