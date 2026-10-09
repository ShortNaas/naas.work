/**
 * Shared helpers for Sanity portable text. Used from both the server (TOC
 * extraction) and client components (rendering), so this module stays free of
 * imports beyond types.
 */

type BlockLike = { children?: unknown } | null | undefined;

/** Concatenated text of one portable-text block. */
export function blockText(value: BlockLike): string {
  const children = value?.children;
  if (!Array.isArray(children)) return "";
  return children
    .map((child) =>
      child && typeof child === "object" && "text" in child
        ? String((child as { text?: unknown }).text ?? "")
        : ""
    )
    .join("");
}

/** URL-safe slug: "Open Source" -> "open-source". */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** Plain text of a whole portable-text array, blocks separated by a space. */
export function portableTextToPlainString(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((block) => blockText(block as BlockLike))
    .filter(Boolean)
    .join(" ")
    .trim();
}

/** One-line summary for meta descriptions; undefined when there is no text. */
export function metaDescription(value: unknown, max = 160): string | undefined {
  const text = portableTextToPlainString(value);
  if (!text) return undefined;
  return text.length <= max ? text : `${text.slice(0, max).trimEnd()}…`;
}

/**
 * Anchor id for a heading. The TOC and the rendered heading must derive the
 * same id from the same text, so both go through here — including the fallback
 * for headings that slugify to nothing (e.g. non-Latin scripts).
 */
export function headingId(text: string): string {
  const trimmed = text.trim();
  return slugify(trimmed) || encodeURIComponent(trimmed) || "section";
}
