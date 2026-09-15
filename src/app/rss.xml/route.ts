import { client } from "@/lib/sanity/client";
import { postsQuery } from "@/lib/sanity/queries";
import type { Post } from "@/lib/sanity/types";

export const revalidate = 3600;

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.naas.work"
).replace(/\/$/, "");

const SITE_TITLE = "Naas";
const SITE_DESCRIPTION = "A little bit of everything.";

/** XML-escape text and strip characters that are invalid in XML 1.0. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    // Control characters other than tab/newline/carriage return are illegal.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

/**
 * RSS 2.0 feed for the blog, generated as plain XML rather than pulling in a
 * feed-building dependency.
 */
export async function GET() {
  let posts: Post[] = [];
  try {
    posts = (await client.fetch<Post[]>(postsQuery)) ?? [];
  } catch (error) {
    console.error("RSS feed: failed to load posts:", error);
  }

  const items = posts
    .slice(0, 30)
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug.current}`;
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : new Date().toUTCString();
      return `    <item>
      <title>${escapeXml(post.title ?? "")}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("\n");

  const lastBuildDate = posts[0]?.publishedAt
    ? new Date(posts[0].publishedAt).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(`${SITE_URL}/rss.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
