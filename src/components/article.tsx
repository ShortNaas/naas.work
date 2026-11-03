import Link from "next/link";
import { responsiveImage } from "@/lib/sanity/image";
import { PortableText } from "@/components/portable-text";
import { formatDateYYYYMMDD } from "@/lib/format-date";
import type { Post } from "@/lib/sanity/types";
import type { TocItem } from "@/lib/toc";

/** Article body, rendered on the server. */
export function Article({
  post,
  toc,
  backLink = { href: "/blog", label: "← Back to blog" },
}: {
  post: Post;
  toc: TocItem[];
  /** Where the "back" affordance points. Log entries pass their collection. */
  backLink?: { href: string; label: string };
}) {
  const cover = post.coverImage
    ? responsiveImage(post.coverImage, { width: 1200, height: 675 })
    : null;

  return (
    <article className="max-w-3xl mx-auto py-8">
      <p className="mb-4 text-sm">
        <Link href={backLink.href} className="text-[color:var(--link-color)] hover:underline">
          {backLink.label}
        </Link>
      </p>
      {cover && (
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-[var(--main-border-color)] mb-6">
          {/* Plain <img> on purpose: the Sanity CDN does the resizing and the
              srcSet keeps phones from downloading the desktop file. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover.src}
            srcSet={cover.srcSet}
            sizes="(max-width: 768px) 100vw, 768px"
            width={cover.width}
            height={cover.height}
            // Above the fold on an article page, so load it eagerly.
            loading="eager"
            fetchPriority="high"
            decoding="async"
            alt={post.coverImage?.alt || `Cover image for ${post.title}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <header className="mb-8">
        <time
          dateTime={post.publishedAt}
          className="text-sm text-[color:var(--text-muted-color)]"
        >
          {formatDateYYYYMMDD(post.publishedAt)}
        </time>
        <h1 className="mt-2 text-3xl font-semibold text-[color:var(--heading-color)]">
          {post.title}
        </h1>
      </header>
      {toc && toc.length > 0 && (
        <nav
          aria-label="Table of contents"
          className="my-6 p-4 rounded-lg border border-[var(--main-border-color)] bg-[var(--card-bg)] text-sm"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-muted-color)] mb-2">
            Contents
          </div>
          <ul className="list-none p-0 m-0 space-y-1 text-[1.05em]">
            {toc.map((item) => (
              <li key={item.id} className={item.level === 3 ? "pl-3" : ""}>
                <a
                  href={`#${item.id}`}
                  className="text-[color:var(--text-color)] hover:text-[color:var(--link-color)] hover:underline no-underline"
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="text-[color:var(--text-color)]">
        <PortableText value={post.body} />
      </div>
    </article>
  );
}
