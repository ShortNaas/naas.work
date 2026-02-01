import { notFound } from "next/navigation";
import { getViewCounts } from "@/lib/views";

export default async function AdminViewsPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const secret = process.env.VIEW_DASHBOARD_SECRET;

  if (!secret || key !== secret) {
    notFound();
  }

  const counts = await getViewCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-[color:var(--heading-color)] mb-2">
        View counts
      </h1>
      <p className="text-sm text-[color:var(--text-muted-color)] mb-6">
        Total page views: <strong className="text-[color:var(--heading-color)]">{total}</strong>
      </p>
      {entries.length === 0 ? (
        <p className="text-sm text-[color:var(--text-muted-color)]">
          No view data yet. Visit some pages and return here.
        </p>
      ) : (
        <ul className="list-none p-0 m-0 space-y-1.5">
          {entries.map(([path, count]) => (
            <li
              key={path}
              className="flex justify-between items-baseline gap-4 text-sm text-[color:var(--text-color)]"
            >
              <span className="min-w-0 truncate font-mono" title={path}>
                {path}
              </span>
              <span className="shrink-0 tabular-nums text-[color:var(--text-muted-color)]">
                {count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
