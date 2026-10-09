/** Extract table-of-contents entries from Sanity portable text body (h2, h3). */
import { blockText, headingId } from "./portable-text";

export type TocItem = { id: string; text: string; level: 2 | 3 };

export function getTocFromBody(body: unknown): TocItem[] {
  if (!body || !Array.isArray(body)) return [];
  const toc: TocItem[] = [];
  for (const block of body as Array<{
    _type?: string;
    style?: string;
    children?: unknown;
  }>) {
    if (block._type !== "block") continue;
    const style = block.style;
    if (style !== "h2" && style !== "h3") continue;
    const text = blockText(block);
    toc.push({ id: headingId(text), text: text.trim(), level: style === "h2" ? 2 : 3 });
  }
  return toc;
}
