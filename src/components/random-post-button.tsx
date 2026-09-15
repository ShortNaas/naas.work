"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Picks a random post and navigates to it. The slug list arrives as a prop from
 * the server, so clicking costs no network round trip.
 *
 * Styled as plain inline text so it reads as part of the paragraph above it —
 * same size, colour, and link hover as the bio links. Reset browser button
 * defaults that would otherwise leak in (background, border, padding, font).
 */
export function RandomPostButton({ slugs }: { slugs: string[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (slugs.length === 0) return null;

  const go = () => {
    // Avoid re-serving the post we are already on when there is a choice.
    const candidates =
      slugs.length > 1 ? slugs.filter((s) => s !== window.location.pathname) : slugs;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    if (!pick) return;
    setBusy(true);
    router.push(pick);
  };

  return (
    <p className="text-base text-[color:var(--text-color)]">
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className="cursor-pointer border-0 bg-transparent p-0 font-sans text-base text-[color:var(--link-color)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--link-color)]"
      >
        {busy ? "Opening…" : "Random post"}
      </button>
    </p>
  );
}
