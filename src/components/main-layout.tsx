"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Footer } from "./footer";
import { SearchOverlay } from "./search-overlay";
import { RightPanel, type LatestPost } from "./right-panel";
import { ScrollToTop } from "./scroll-to-top";
import { TocProvider } from "@/contexts/toc-context";
import type { SearchIndex } from "@/app/api/search/route";

export function MainLayout({
  children,
  latestPosts,
}: {
  children: React.ReactNode;
  /** Rendered on the server so the panel needs no client-side fetch. */
  latestPosts: LatestPost[];
}) {
  const pathname = usePathname();
  // Remember *which* route the drawer was opened on, so navigating away closes
  // it without a setState-in-effect.
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchData, setSearchData] = useState<SearchIndex | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);

  const sidebarOpen = openForPath === pathname;
  const toggleSidebar = () =>
    setOpenForPath((current) => (current === pathname ? null : pathname));

  // Everything happens in this click handler: reset, request, open. No effect
  // needed, so there is no extra render pass before the fetch starts.
  const openSearch = () => {
    setSearchOpen(true);
    setSearchData(null);
    setSearchError(false);
    setSearchLoading(true);
    fetch("/api/search")
      .then((res) => res.json())
      .then((json: SearchIndex) => setSearchData(json))
      .catch(() => setSearchError(true))
      .finally(() => setSearchLoading(false));
  };

  // Close the mobile drawer on Escape.
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenForPath(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  return (
    <TocProvider>
      <Sidebar open={sidebarOpen} />
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpenForPath(null)}
        />
      )}
      <div
        id="main-wrapper"
        className="min-h-screen flex justify-center"
      >
        <div className="w-full max-w-[1250px] flex flex-col px-4 xl:px-10">
          <Topbar
            onMenuClick={toggleSidebar}
            onSearchClick={openSearch}
            sidebarOpen={sidebarOpen}
          />
          <div className="row flex-grow flex flex-col lg:flex-row">
            <main
              aria-label="Main Content"
              className="flex-1 w-full lg:w-11/12 xl:w-9/12 px-0 md:px-4 py-6"
            >
              {children}
            </main>
            <aside
              aria-label="Panel"
              className="hidden xl:block xl:w-3/12 ps-2 text-sm text-[color:var(--text-muted-color)]"
            >
              <RightPanel posts={latestPosts} />
            </aside>
          </div>
          <div className="row">
            <div id="tail-wrapper" className="w-full lg:w-11/12 xl:w-9/12 px-0 md:px-4">
              <Footer />
            </div>
          </div>
        </div>
      </div>
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        data={searchData}
        loading={searchLoading}
        error={searchError}
      />
      <ScrollToTop />
    </TocProvider>
  );
}
