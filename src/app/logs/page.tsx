import { client } from "@/lib/sanity/client";
import { logsQuery } from "@/lib/sanity/queries";
import type { Logs } from "@/lib/sanity/types";
import Link from "next/link";

async function getLogs(): Promise<Logs[]> {
  const logs = await client.fetch<Logs[]>(logsQuery);
  return logs ?? [];
}

export default async function LogsPage() {
  const logs = await getLogs();

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-[color:var(--heading-color)] mb-2">
        Logs
      </h1>
      <p className="text-sm text-[color:var(--text-muted-color)] mb-8">
        Every update, write-up, and experiment log—all in one feed.
      </p>

      {logs.length === 0 ? (
        <p className="text-sm text-[color:var(--text-muted-color)]">
          No logs yet.
        </p>
      ) : (
        <ul className="list-none p-0 m-0 space-y-3">
          {logs.map((logs) => (
            <li key={logs._id}>
              <Link
                href={`/logs/${logs.slug.current}`}
                className="no-underline group flex flex-col gap-0.5"
              >
                <span
                  className="font-semibold text-[color:var(--heading-color)] group-hover:text-[color:var(--link-color)] transition-colors"
                  style={{ fontSize: "1.05em" }}
                >
                  {logs.title}
                </span>
                {logs.description && (
                  <span
                    className="text-[color:var(--text-muted-color)]"
                    style={{ fontSize: "0.9em" }}
                  >
                    {logs.description}
                  </span>
                )}
                <span
                  className="text-[color:var(--text-muted-color)]"
                  style={{ fontSize: "0.85em" }}
                >
                  {logs.entryCount ?? 0}{" "}
                  {logs.entryCount === 1 ? "logs" : "logs"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
