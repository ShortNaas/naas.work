import { client } from "@/lib/sanity/client";
import { writeupsQuery } from "@/lib/sanity/queries";
import type { Writeup } from "@/lib/sanity/types";
import Link from "next/link";

async function getWriteups(): Promise<Writeup[]> {
  const writeups = await client.fetch<Writeup[]>(writeupsQuery);
  return writeups ?? [];
}

export default async function WriteupsPage() {
  const writeups = await getWriteups();

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-[color:var(--heading-color)] mb-2">
        Writeups
      </h1>
      <p className="text-sm text-[color:var(--text-muted-color)] mb-8">
        CTF and security challenge write-ups, grouped by series.
      </p>

      {writeups.length === 0 ? (
        <p className="text-sm text-[color:var(--text-muted-color)]">
          No writeups yet.
        </p>
      ) : (
        <ul className="list-none p-0 m-0 space-y-3">
          {writeups.map((writeup) => (
            <li key={writeup._id}>
              <Link
                href={`/writeups/${writeup.slug.current}`}
                className="no-underline group flex flex-col gap-0.5"
              >
                <span
                  className="font-semibold text-[color:var(--heading-color)] group-hover:text-[color:var(--link-color)] transition-colors"
                  style={{ fontSize: "1.05em" }}
                >
                  {writeup.title}
                </span>
                {writeup.description && (
                  <span
                    className="text-[color:var(--text-muted-color)]"
                    style={{ fontSize: "0.9em" }}
                  >
                    {writeup.description}
                  </span>
                )}
                <span
                  className="text-[color:var(--text-muted-color)]"
                  style={{ fontSize: "0.85em" }}
                >
                  {writeup.entryCount ?? 0}{" "}
                  {writeup.entryCount === 1 ? "writeup" : "writeups"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
