/*
 * No "use client": this is presentational, so server pages render it to HTML
 * and the browser never downloads a renderer it cannot use.
 */
import {
  PortableText as PortableTextRenderer,
  type PortableTextComponentProps,
} from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { inlineImageDimensions, responsiveImage } from "@/lib/sanity/image";
import { blockText, headingId } from "@/lib/portable-text";

type BlockProps = PortableTextComponentProps<PortableTextBlock>;

/** How wide an embedded image is allowed to render. */
export type ImageSize = "full" | "inline";

type BodyImageValue = {
  _type?: string;
  asset?: unknown;
  alt?: string;
  caption?: string;
};

/**
 * Renders an embedded image. Covers both shapes present in the dataset: the
 * structured `bodyImage` (alt + caption) and the legacy bare image block that
 * logs entries used before it existed.
 */
function BodyImage({
  value,
  size,
}: {
  value?: BodyImageValue;
  size: ImageSize;
}) {
  if (!value?.asset) return null;

  const img = responsiveImage(value.asset, inlineImageDimensions);
  const sizes = size === "full" ? "(max-width: 768px) 100vw, 768px" : "240px";

  return (
    <figure className={size === "full" ? "my-6" : "my-3"}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.src}
        srcSet={img.srcSet}
        sizes={sizes}
        width={img.width}
        height={img.height}
        loading="lazy"
        decoding="async"
        alt={value.alt ?? ""}
        className={
          size === "full"
            ? "w-full h-auto rounded-lg"
            : "w-full max-w-[240px] h-auto rounded"
        }
      />
      {value.caption && (
        <figcaption className="mt-2 text-xs text-[color:var(--text-muted-color)]">
          {value.caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Builds the component map for a given size, so the image width can vary per
 * call site without the map capturing a stale value.
 */
function buildComponents(size: ImageSize) {
  return {
    block: {
      normal: ({ children }: BlockProps) => (
        <p className="mb-4 text-[color:var(--text-color)] leading-relaxed text-[1rem]">{children}</p>
      ),
      h1: ({ children }: BlockProps) => (
        <h1 className="text-2xl font-semibold text-[color:var(--heading-color)] mt-8 mb-4">
          {children}
        </h1>
      ),
      h2: ({ value, children }: BlockProps) => {
        const id = headingId(blockText(value));
        return (
          <h2 id={id} className="text-xl font-semibold text-[color:var(--heading-color)] mt-6 mb-3 scroll-mt-[3.5rem]">
            {children}
          </h2>
        );
      },
      h3: ({ value, children }: BlockProps) => {
        const id = headingId(blockText(value));
        return (
          <h3 id={id} className="text-lg font-medium text-[color:var(--heading-color)] mt-4 mb-2 scroll-mt-[3.5rem]">
            {children}
          </h3>
        );
      },
    },
    list: {
      bullet: ({ children }: BlockProps) => (
        <ul className="list-disc pl-6 mb-4 space-y-1 text-[color:var(--text-color)]">
          {children}
        </ul>
      ),
      number: ({ children }: BlockProps) => (
        <ol className="list-decimal pl-6 mb-4 space-y-1 text-[color:var(--text-color)]">
          {children}
        </ol>
      ),
    },
    listItem: {
      bullet: ({ children }: BlockProps) => (
        <li className="leading-relaxed">{children}</li>
      ),
      number: ({ children }: BlockProps) => (
        <li className="leading-relaxed">{children}</li>
      ),
    },
    marks: {
      link: ({ children, value }: { children?: React.ReactNode; value?: { href?: string } }) => {
        const href = value?.href || "";
        const isExternal =
          href.startsWith("http://") ||
          href.startsWith("https://") ||
          href.startsWith("//");
        return (
          <a
            href={href}
            className="text-[color:var(--link-color)] hover:underline"
            {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {children}
          </a>
        );
      },
    },
    types: {
      // Structured image with alt text and optional caption.
      bodyImage: ({ value }: { value?: BodyImageValue }) => (
        <BodyImage value={value} size={size} />
      ),
      // Legacy bare image block, still present in older documents.
      image: ({ value }: { value?: BodyImageValue }) => (
        <BodyImage value={value} size={size} />
      ),
    },
  };
}

interface PortableTextProps {
  value: PortableTextBlock[] | null | undefined;
  className?: string;
  /**
   * "full" for long-form bodies (posts, pages, book notes, logs).
   * "inline" for compact list contexts (favorites, tools) so an illustration
   * does not dominate the list.
   */
  size?: ImageSize;
}

export function PortableText({
  value,
  className = "",
  size = "full",
}: PortableTextProps) {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return null;
  }
  return (
    <div className={`max-w-none ${className}`}>
      <PortableTextRenderer value={value} components={buildComponents(size)} />
    </div>
  );
}
