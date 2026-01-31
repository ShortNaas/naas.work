"use client";

import { usePathname } from "next/navigation";
import { MainLayout } from "./main-layout";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't wrap Sanity Studio or other full-screen routes
  if (pathname?.startsWith("/studio")) {
    return <>{children}</>;
  }

  return <MainLayout>{children}</MainLayout>;
}
