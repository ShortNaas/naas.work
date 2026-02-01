import Link from "next/link";
import { client } from "@/lib/sanity/client";
import { siteSettingsQuery, projectsQuery } from "@/lib/sanity/queries";
import type { SiteSettings, Project } from "@/lib/sanity/types";
import { ContactForm } from "@/components/contact-form";

async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const settings = await client.fetch<SiteSettings>(siteSettingsQuery);
    return settings;
  } catch {
    return null;
  }
}

async function getProjects(): Promise<Project[]> {
  try {
    const projects = await client.fetch<Project[]>(projectsQuery);
    return projects ?? [];
  } catch {
    return [];
  }
}

export default async function ContactPage() {
  const [settings, projects] = await Promise.all([
    getSiteSettings(),
    getProjects(),
  ]);
  const links = settings?.links ?? [];

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-[color:var(--heading-color)] mb-2">
        Contact
      </h1>
      <p className="text-sm text-[color:var(--text-muted-color)] mb-8">
        Send a message below.
      </p>

      <ContactForm projects={projects} />

      {links.length > 0 && (
        <div className="mt-10 pt-8 border-t border-[var(--main-border-color)]">
          <p className="text-sm font-medium text-[color:var(--heading-color)] mb-3">
            Or reach out via
          </p>
          <ul className="list-none p-0 m-0 space-y-3">
            {links.map((link, i) => (
              <li key={i}>
                <Link
                  href={link.url}
                  className="text-[color:var(--link-color)] hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
