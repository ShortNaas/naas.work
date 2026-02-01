"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome,
  IconDocument,
  IconFolder,
  IconMilestone,
  IconUser,
  IconEnvelope,
  IconStar,
  IconGithub,
  IconInstagram,
  IconYoutube,
  IconSoundcloud,
  IconX,
} from "./icons";

const navItems: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { href: "/", label: "Home", icon: IconHome },
  { href: "/blog", label: "Blog", icon: IconDocument },
  { href: "/projects", label: "Projects", icon: IconFolder },
  { href: "/favorite", label: "Favorites", icon: IconStar },
  { href: "/milestones", label: "Milestones", icon: IconMilestone },
  { href: "/about", label: "About", icon: IconUser },
  { href: "/contact", label: "Contact", icon: IconEnvelope },
];

const socialLinks: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { href: "https://github.com/shortnaas", label: "GitHub", icon: IconGithub },
  { href: "https://x.com/shortnaas", label: "X", icon: IconX },
  { href: "https://instagram.com/shortnaas", label: "Instagram", icon: IconInstagram },
  { href: "https://soundcloud.com/shortnaas", label: "SoundCloud", icon: IconSoundcloud },
  { href: "https://www.youtube.com/@shortnaas", label: "YouTube", icon: IconYoutube },
];

export function Sidebar({ open }: { open: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      id="sidebar"
      aria-label="Sidebar"
      className={`fixed top-0 left-0 h-full w-[232px] xl:w-[264px] flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border-color)] z-40 overflow-y-auto
        transition-transform duration-200 ease-out
        lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      <header className="flex flex-col items-center justify-center text-center px-4 pt-6 lg:pt-8 flex-shrink-0 w-full">
        <Link
          href="/"
          id="avatar"
          className="block text-4xl font-bold tracking-tight text-[color:var(--heading-color)] hover:text-[color:var(--link-color)] transition-colors no-underline"
        >
          NAAS
        </Link>
      </header>

      <nav className="flex-1 w-full px-4 py-2 flex flex-col items-start" aria-label="Main">
        <ul className="flex flex-col list-none p-0 m-0 w-full">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <li
                key={item.href}
                className={index === 0 ? "" : "mt-1 w-full"}
              >
                <Link
                  href={item.href}
                  className={`flex items-center justify-start w-full pl-3 pr-4 py-2.5 rounded-xl font-semibold text-sm transition-colors
                    ${isActive
                      ? "text-[color:var(--sidebar-active-color)] bg-[var(--sidebar-hover-bg)]"
                      : "text-[color:var(--sidebar-muted-color)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[color:var(--sidebar-active-color)]"
                    }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0 mr-3 opacity-80" />
                  <span className="tracking-wide">{item.label.toUpperCase()}</span>
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
