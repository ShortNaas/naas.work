"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconSearch, IconBars } from "./icons";
import { ThemeToggle } from "./theme-toggle";

const topbarTitles: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/projects": "Projects",
  "/books": "Books",
  "/blog": "Blog",
  "/contact": "Contact",
};

function getBreadcrumb(pathname: string) {
  if (pathname === "/") return [{ label: "Home", href: "/" }];
  const segments = pathname.split("/").filter(Boolean);
  const items = [{ label: "Home", href: "/" }];
  let acc = "";
  for (const seg of segments) {
    acc += `/${seg}`;
    const title = topbarTitles[acc] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
    items.push({ label: title, href: acc });
  }
  return items;
}

export function Topbar({
  onMenuClick,
  onSearchClick,
}: {
  onMenuClick?: () => void;
  onSearchClick?: () => void;
}) {
  const pathname = usePathname();
  const breadcrumb = getBreadcrumb(pathname);

  return (
    <header
      id="topbar-wrapper"
      className="flex-shrink-0 h-12 flex items-center bg-[var(--topbar-bg)] border-b border-[var(--main-border-color)] z-30"
      aria-label="Top Bar"
    >
      <div
        id="topbar"
        className="flex items-center justify-between w-full px-4 lg:px-6 h-full"
      >
        <nav id="breadcrumb" aria-label="Breadcrumb" className="hidden lg:flex items-center gap-1 text-base text-[color:var(--text-muted-color)] pl-2">
          {breadcrumb.map((item, i) => (
            <span key={item.href} className="flex items-center gap-1">
              {i > 0 && <span className="opacity-60">›</span>}
              {i === breadcrumb.length - 1 ? (
                <span>{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="text-[color:var(--link-color)] hover:underline"
                >
                  {item.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        <button
          type="button"
          id="sidebar-trigger"
          aria-label="Toggle sidebar"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-[color:var(--topbar-text-color)] hover:bg-[var(--sidebar-hover-bg)]"
        >
          <IconBars className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            id="search-trigger"
            aria-label="Search"
            onClick={onSearchClick}
            className="p-2 rounded-md text-[color:var(--topbar-text-color)] hover:bg-[var(--sidebar-hover-bg)]"
          >
            <IconSearch className="w-5 h-5" />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
