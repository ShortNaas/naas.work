/** Format an ISO or date string as YYYY-MM-DD (numbers only) for site-wide consistency. */
export function formatDateYYYYMMDD(iso: string | undefined): string {
  if (!iso || iso.length < 10) return "";
  return iso.slice(0, 10);
}
