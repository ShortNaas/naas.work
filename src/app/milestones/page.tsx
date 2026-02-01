import { client } from "@/lib/sanity/client";
import { formatDateYYYYMMDD } from "@/lib/format-date";
import { milestonesQuery } from "@/lib/sanity/queries";
import type { Milestone } from "@/lib/sanity/types";

async function getMilestones(): Promise<Milestone[]> {
  const milestones = await client.fetch<Milestone[]>(milestonesQuery);
  return milestones ?? [];
}

function groupByYear(milestones: Milestone[]) {
  const byYear: Record<string, Milestone[]> = {};
  for (const m of milestones) {
    const year = m.date ? m.date.slice(0, 4) : "Unknown";
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(m);
  }
  return Object.entries(byYear).sort(([a], [b]) => Number(b) - Number(a));
}

export default async function MilestonesPage() {
  const milestones = await getMilestones();
  const byYear = groupByYear(milestones);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="dynamic-title text-2xl font-semibold text-[color:var(--heading-color)] mb-6">
        Milestones
      </h1>
      {milestones.length === 0 ? (
        <p className="text-sm text-[color:var(--text-muted-color)]">No milestones yet.</p>
      ) : (
        <div id="archives" className="content">
          {byYear.map(([year, items]) => (
            <div key={year}>
              <time className="year block" dateTime={year}>
                {year}
              </time>
              <ul className="list-none p-0 m-0">
                {items.map((m) => (
                  <li key={m._id}>
                    <span className="archives-date">{formatDateYYYYMMDD(m.date)}</span>
                    <span className="archives-title">{m.title}</span>
                    {m.note && (
                      <span className="archives-note">: {m.note}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
