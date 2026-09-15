import type { Metadata } from "next";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { GoatCounter } from "@/components/goatcounter";
import { client } from "@/lib/sanity/client";
import { latestPostsQuery } from "@/lib/sanity/queries";
import type { LatestPost } from "@/components/right-panel";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.naas.work"
).replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Naas",
  description: "A little bit of everything.",
  alternates: {
    types: { "application/rss+xml": `${SITE_URL}/rss.xml` },
  },
};

/**
 * Fetched here (server-side) so the right panel ships as HTML instead of
 * triggering a client fetch on every page load.
 */
async function getLatestPosts(): Promise<LatestPost[]> {
  try {
    const posts = await client.fetch<LatestPost[]>(latestPostsQuery);
    return posts ?? [];
  } catch {
    return [];
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const latestPosts = await getLatestPosts();

  // Browser extensions (LanguageTool writes `data-lt-installed`) add attributes
  // to <html> before React hydrates, which produces a hydration mismatch that
  // cannot be patched. React honours this flag only one level deep, which is
  // exactly this element, so it does not mask mismatches inside the app tree.
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[var(--background)] text-[color:var(--foreground)]">
        <LayoutWrapper latestPosts={latestPosts}>{children}</LayoutWrapper>
        <GoatCounter />
      </body>
    </html>
  );
}
