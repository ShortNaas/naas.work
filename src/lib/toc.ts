/** Extract table-of-contents entries from Sanity portable text body (h2, h3). */
export type TocItem = { id: string; text: string; level: 2 | 3 };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function getTocFromBody(body: unknown): TocItem[] {
  if (!body || !Array.isArray(body)) return [];
  const toc: TocItem[] = [];
  for (const block of body as Array<{ _type?: string; style?: string; children?: Array<{ _type?: string; text?: string }> }>) {
    if (block._type !== "block" || !block.children) continue;
    const style = block.style as string | undefined;
    if (style !== "h2" && style !== "h3") continue;
    const text = block.children.map((c) => (c && "text" in c ? c.text : "")).join("");
    const id = slugify(text) || toc.length.toString();
    toc.push({ id, text: text.trim(), level: style === "h2" ? 2 : 3 });
  }
  return toc;
}
