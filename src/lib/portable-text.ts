/** Convert Sanity portable text (array of blocks) to a plain string. */
export function portableTextToPlainString(value: unknown): string {
  if (!value || !Array.isArray(value)) return "";
  let out = "";
  for (const block of value as Array<{ _type?: string; children?: Array<{ text?: string }> }>) {
    if (block._type !== "block" || !block.children) continue;
    const text = block.children.map((c) => (c && "text" in c ? c.text ?? "" : "")).join("");
    if (out) out += " ";
    out += text;
  }
  return out.trim();
}
