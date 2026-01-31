"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { IconSun, IconMoon } from "./icons";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Switch theme"
        className="p-2 rounded-md text-[color:var(--sidebar-muted-color)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[color:var(--sidebar-active-color)] transition-colors"
      >
        <span className="w-5 h-5 block" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Switch theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 rounded-md text-[color:var(--topbar-text-color)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[color:var(--sidebar-active-color)] transition-colors [.sidebar-bottom_&]:text-[color:var(--sidebar-muted-color)]"
    >
      {isDark ? (
        <IconSun className="w-5 h-5" />
      ) : (
        <IconMoon className="w-5 h-5" />
      )}
    </button>
  );
}
