import Link from "next/link";
import { responsiveImage } from "@/lib/sanity/image";
import { PortableText } from "@/components/portable-text";
import { TocRegistrar } from "@/components/toc-registrar";
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
      <TocRegistrar toc={toc} />
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
            alt=""
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
      <div className="text-[color:var(--text-color)]">
        <PortableText value={post.body} />
      </div>
    </article>
  );
}
