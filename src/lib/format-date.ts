/** Format an ISO or date string as YYYY-MM-DD (numbers only) for site-wide consistency. */
export function formatDateYYYYMMDD(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
