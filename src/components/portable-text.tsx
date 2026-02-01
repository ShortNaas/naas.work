"use client";

import { PortableText as PortableTextRenderer, type PortableTextComponentProps } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function getBlockText(value: PortableTextBlock | null): string {
  if (!value?.children) return "";
  return value.children
    .map((c) => (typeof c === "object" && c !== null && "text" in c ? (c as { text?: string }).text : ""))
    .join("");
}

type BlockProps = PortableTextComponentProps<PortableTextBlock>;

const components = {
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
      const id = slugify(getBlockText(value ?? null)) || "h2";
      return (
        <h2 id={id} className="text-xl font-semibold text-[color:var(--heading-color)] mt-6 mb-3 scroll-mt-[3.5rem]">
          {children}
        </h2>
      );
    },
    h3: ({ value, children }: BlockProps) => {
      const id = slugify(getBlockText(value ?? null)) || "h3";
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
    link: ({ children, value }: { children?: React.ReactNode; value?: { href?: string } }) => (
      <a
        href={value?.href}
        className="text-[color:var(--link-color)] hover:underline"
      >
        {children}
      </a>
    ),
  },
};

interface PortableTextProps {
  value: PortableTextBlock[] | null | undefined;
  className?: string;
}

export function PortableText({ value, className = "" }: PortableTextProps) {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return null;
  }
  return (
    <div className={`prose prose-invert:false max-w-none ${className}`}>
      <PortableTextRenderer value={value} components={components} />
    </div>
  );
}
