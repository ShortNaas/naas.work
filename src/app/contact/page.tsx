import Link from "next/link";
import { client } from "@/lib/sanity/client";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import type { SiteSettings } from "@/lib/sanity/types";

async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const settings = await client.fetch<SiteSettings>(siteSettingsQuery);
    return settings;
  } catch {
    return null;
  }
}

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const links = settings?.links ?? [];

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-[color:var(--heading-color)] mb-8">
        Contact
      </h1>
      {links.length === 0 ? (
        <p className="text-sm text-[color:var(--text-muted-color)]">
          Add links in Sanity Studio (Site Settings → Links).
        </p>
      ) : (
        <ul className="list-none p-0 m-0 space-y-3">
          {links.map((link, i) => (
            <li key={i}>
              <Link
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[color:var(--link-color)] hover:underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
