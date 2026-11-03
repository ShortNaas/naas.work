import type { Metadata } from "next";
import { client } from "@/lib/sanity/client";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import type { SiteSettings } from "@/lib/sanity/types";
import { responsiveImage } from "@/lib/sanity/image";
import { PortableText } from "@/components/portable-text";

export const metadata: Metadata = { title: "About" };

async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const settings = await client.fetch<SiteSettings>(siteSettingsQuery);
    return settings;
  } catch {
    return null;
  }
}

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-[color:var(--heading-color)] mb-8">
        About
      </h1>
      {settings?.avatar && (
        <div className="mb-8">
          {/* Plain <img> on purpose: sized by Sanity's CDN with a srcSet. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            {...responsiveImage(settings.avatar, { width: 224, height: 224 })}
            sizes="112px"
            loading="lazy"
            decoding="async"
            alt="Portrait of Naas"
            className="w-28 h-28 rounded-full object-cover border-2 border-[var(--avatar-border-color)] shadow-[var(--card-shadow)]"
          />
        </div>
      )}
      {settings?.fullBio && settings.fullBio.length > 0 ? (
        <div className="text-base text-[color:var(--text-color)]">
          <PortableText value={settings.fullBio} />
        </div>
      ) : (
        <p className="text-sm text-[color:var(--text-muted-color)]">
          Add your full bio in Sanity Studio (Site Settings → Full bio).
        </p>
      )}
      {settings?.links && settings.links.length > 0 && (
        <div className="mt-8 pt-6 border-t border-[var(--main-border-color)]">
          <h2 className="text-lg font-medium text-[color:var(--heading-color)] mb-3">
            Links
          </h2>
          <ul className="list-none p-0 m-0 flex flex-wrap gap-4">
            {settings.links.map((link, i) => {
              const isExternal =
                link.url.startsWith("http://") ||
                link.url.startsWith("https://") ||
                link.url.startsWith("//");
              return (
                <li key={i}>
                  <a
                    href={link.url}
                    className="text-[color:var(--link-color)] hover:underline"
                    {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
