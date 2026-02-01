"use client";

import { useEffect } from "react";
import { urlFor } from "@/lib/sanity/image";
import { PortableText } from "@/components/portable-text";
import { useToc } from "@/contexts/toc-context";
import { formatDateYYYYMMDD } from "@/lib/format-date";
import type { Post } from "@/lib/sanity/types";
import type { TocItem } from "@/lib/toc";

export function PostPageClient({
  post,
  toc,
}: {
  post: Post;
  toc: TocItem[];
}) {
  const { setToc } = useToc();

  useEffect(() => {
    setToc(toc);
    return () => setToc(null);
  }, [toc, setToc]);

  return (
    <article className="max-w-3xl mx-auto py-8">
      {post.coverImage && (
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-[var(--main-border-color)] mb-6">
          <img
            src={urlFor(post.coverImage).width(1200).height(630).url()}
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
