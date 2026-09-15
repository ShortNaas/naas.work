"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Picks a random post and navigates to it. The slug list arrives as a prop from
 * the server, so clicking costs no network round trip.
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
    <button
      type="button"
      onClick={go}
      disabled={busy}
      className="mt-2 cursor-pointer rounded-lg border border-[var(--main-border-color)] bg-[var(--card-bg)] px-4 py-2 text-sm text-[color:var(--text-color)] transition-colors hover:border-[var(--link-color)] hover:text-[color:var(--link-color)] disabled:opacity-60"
    >
      {busy ? "Opening…" : "🎲 Random post"}
    </button>
  );
}
