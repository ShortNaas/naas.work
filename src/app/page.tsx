import { client } from "@/lib/sanity/client";
import { siteSettingsQuery, postSlugsQuery } from "@/lib/sanity/queries";
import { SiteSettings } from "@/lib/sanity/types";
import { PortableText } from "@/components/portable-text";
import { RandomPostButton } from "@/components/random-post-button";

async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const settings = await client.fetch<SiteSettings>(siteSettingsQuery);
    return settings;
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return null;
  }
}

/** Slugs for the random-post button, prefixed so one click is a plain push. */
async function getPostPaths(): Promise<string[]> {
  try {
    const slugs = await client.fetch<string[]>(postSlugsQuery);
    return (slugs ?? []).map((slug) => `/blog/${slug}`);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [settings, postPaths] = await Promise.all([
    getSiteSettings(),
    getPostPaths(),
  ]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <section className="max-w-xl text-center space-y-4">
        <h1 className="text-3xl font-semibold sm:text-4xl text-[color:var(--heading-color)]">
          {settings?.heroTitle || "Hi, I'm Naas."}
        </h1>
        <p className="text-sm uppercase tracking-wide text-[color:var(--text-muted-color)]">
          {settings?.heroSubtitle || "A little bit of everything."}
        </p>
        <div className="text-base text-[color:var(--text-color)] [&_a]:text-[color:var(--link-color)] [&_a]:hover:underline">
          {settings?.shortBio && Array.isArray(settings.shortBio) && settings.shortBio.length > 0 ? (
            <PortableText value={settings.shortBio} />
          ) : (
            <p>
              I write about ideas I find interesting, document projects I&apos;m working on, and keep a log of milestones along the way.
            </p>
          )}
        </div>
        <RandomPostButton slugs={postPaths} />
      </section>
    </div>
  );
}
