"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Footer } from "./footer";
import { SearchOverlay } from "./search-overlay";
import { RightPanel } from "./right-panel";
import { ScrollToTop } from "./scroll-to-top";
import { TocProvider } from "@/contexts/toc-context";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Close mobile sidebar when route changes (e.g. after tapping a nav link)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <TocProvider>
      <Sidebar open={sidebarOpen} />
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        id="main-wrapper"
        className="min-h-screen flex justify-center transition-[margin] duration-200"
      >
        <div className="w-full max-w-[1250px] flex flex-col px-4 xl:px-10">
          <Topbar
            onMenuClick={() => setSidebarOpen((o) => !o)}
            onSearchClick={() => setSearchOpen((o) => !o)}
          />
          <div className="row flex-grow-1 flex flex-col lg:flex-row">
            <main
              aria-label="Main Content"
              className="flex-1 w-full lg:w-11/12 xl:w-9/12 px-0 md:px-4 py-6"
            >
              {children}
            </main>
            {/* Right panel placeholder – can add update-list, trending-tags later */}
            <aside
              aria-label="Panel"
              className="hidden xl:block xl:w-3/12 ps-2 text-sm text-[color:var(--text-muted-color)]"
            >
              <RightPanel />
            </aside>
          </div>
          <div className="row">
            <div id="tail-wrapper" className="w-full lg:w-11/12 xl:w-9/12 px-0 md:px-4">
              <Footer />
            </div>
          </div>
        </div>
      </div>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ScrollToTop />
    </TocProvider>
  );
}
