import type { PortableTextBlock } from "@portabletext/types";

export interface SiteSettings {
  heroTitle?: string;
  heroSubtitle?: string;
  shortBio?: PortableTextBlock[];
  fullBio?: PortableTextBlock[];
  avatar?: {
    asset: {
      _ref: string;
      _type: string;
    };
  };
  links?: Array<{
    label: string;
    url: string;
  }>;
}

export interface Post {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  publishedAt: string;
  coverImage?: {
    asset: {
      _ref: string;
      _type: string;
    };
    alt?: string;
  };
  body?: PortableTextBlock[];
  excerpt?: string;
}

export interface Project {
  _id: string;
  title: string;
  image?: {
    asset: {
      _ref: string;
      _type: string;
    };
  };
  description?: PortableTextBlock[];
  link?: string;
  /** Pinned projects sort above everything else. */
  pinned?: boolean;
  /** Drag-and-drop ordering key managed by the Studio. */
  orderRank?: string | null;
  kind?: Array<{ _id: string; title: string }>;
}

export interface Page {
  _id: string;
  title: string;
  slug: { current: string };
  body?: unknown;
}

export interface Book {
  _id: string;
  title: string;
  slug: { current: string };
  author?: string;
  cover?: {
    asset: { _ref: string; _type: string };
  };
  isbn?: string;
  dateRead?: string;
  rating?: number;
  amazonUrl?: string;
  summary?: PortableTextBlock[];
  body?: PortableTextBlock[];
}

export interface FavoriteCategory {
  _id: string;
  title: string;
}

export interface Favorite {
  _id: string;
  name: string;
  description?: PortableTextBlock[];
  link?: string;
  _updatedAt?: string;
  category?: FavoriteCategory | null;
}

export interface ToolCategory {
  _id: string;
  title: string;
}

export interface Tool {
  _id: string;
  name: string;
  description?: PortableTextBlock[];
  link?: string;
  _updatedAt?: string;
  category?: ToolCategory | null;
  /** Kept on the page: struck through, last in its category, badged. */
  archived?: boolean;
  /** Why I stopped using it. Only rendered while `archived`. */
  archivedNote?: string;
}

export interface LogsEntryRef {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt?: string;
}

export interface Logs {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  entryCount?: number;
  entries?: LogsEntryRef[];
}

export interface LogsEntry {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt?: string;
  coverImage?: {
    asset: { _ref: string; _type: string };
    alt?: string;
  };
  body?: PortableTextBlock[];
  logs?: {
    title: string;
    slug: { current: string };
  };
}

export interface KeepGoingItem {
  _id: string;
  mediaType: "image" | "video" | "gif";
  localUrl?: string;
  itemNumber?: number;
  image?: {
    asset?: {
      _id: string;
      url: string;
      metadata?: {
        dimensions?: {
          width: number;
          height: number;
          aspectRatio: number;
        };
        lqip?: string;
      };
    };
  };
  video?: {
    asset?: {
      _id: string;
      url: string;
      mimeType?: string;
    };
  };
  videoFile?: {
    asset?: {
      _id: string;
      url: string;
      mimeType?: string;
    };
  };
  orderRank?: string | null;
}
