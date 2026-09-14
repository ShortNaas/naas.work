"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconGithub,
  IconInstagram,
  IconYoutube,
  IconSoundcloud,
  IconX,
} from "./icons";

const navItems: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const socialLinks: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { href: "https://github.com/shortnaas", label: "GitHub", icon: IconGithub },
  { href: "https://x.com/shortnaas", label: "X", icon: IconX },
  {
    href: "https://instagram.com/shortnaas",
    label: "Instagram",
    icon: IconInstagram,
  },
  {
    href: "https://soundcloud.com/shortnaas",
    label: "SoundCloud",
    icon: IconSoundcloud,
  },
  {
    href: "https://www.youtube.com/@shortnaas",
    label: "YouTube",
    icon: IconYoutube,
  },
];

export function Sidebar({ open }: { open: boolean }) {
  const pathname = usePathname();

  /*
   * Position, visibility, and focusability for the mobile drawer all come from
   * the #sidebar rules in globals.css, which is why only `is-open` is toggled
   * here. `inert` is a boolean attribute and cannot be made responsive, so it
   * must not be used on an element that is permanently visible on desktop.
   */
  return (
    <aside
      id="sidebar"
      aria-label="Sidebar"
      className={`fixed top-0 left-0 h-full w-[232px] xl:w-[264px] flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border-color)] z-40 overflow-y-auto
        transition-transform duration-200 ease-out
        ${open ? "is-open" : ""}`}
    >
      <header className="flex flex-col items-center justify-center text-center px-4 pt-12 pb-6 flex-shrink-0 w-full">
        <Link
          href="/"
          id="avatar"
          className="block text-4xl font-bold tracking-[0.2em] text-[color:var(--heading-color)] hover:text-[color:var(--link-color)] transition-colors no-underline"
        >
          NAAS
        </Link>
      </header>

      <nav
        className="flex-1 w-full pl-6 pr-4 pt-2 pb-2 flex flex-col items-start"
        aria-label="Main"
      >
        <ul className="flex flex-col list-none p-0 m-0 w-full">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <li key={item.href} className="w-full">
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center w-full border-l-2 py-2 pl-3 pr-2 text-sm tracking-wide transition-colors
                    ${
                      isActive
                        ? "border-[var(--link-color)] text-[color:var(--sidebar-active-color)] font-semibold"
                        : "border-transparent text-[color:var(--sidebar-muted-color)] hover:text-[color:var(--sidebar-active-color)] hover:border-[var(--sidebar-border-color)]"
                    }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-bottom flex flex-wrap items-center justify-center gap-2 px-4 pb-6 w-full">
        {socialLinks.map((link) => {
          const SocialIcon = link.icon;
          return (
            <a
              key={link.href}
              href={link.href}
              aria-label={link.label}
              title={link.label}
              rel="me noopener noreferrer"
              target="_blank"
              className="w-7 h-7 rounded-full bg-[var(--sidebar-btn-bg)] text-[color:var(--sidebar-btn-color)] hover:text-[color:var(--sidebar-btn-hover-color)] flex items-center justify-center transition-colors shadow-[0_0_0_1px_var(--sidebar-border-color)]"
            >
              <SocialIcon className="w-3.5 h-3.5" />
            </a>
          );
        })}
      </div>
    </aside>
  );
}
