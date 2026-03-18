export interface SiteSettings {
  heroTitle?: string;
  heroSubtitle?: string;
  shortBio?: any; // Portable text array (same as fullBio)
  fullBio?: any; // Portable text array
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
  };
  body?: any; // Portable text array
  excerpt?: string;
}

export interface Project {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  image?: {
    asset: {
      _ref: string;
      _type: string;
    };
  };
  description?: any; // Portable text array
  link?: string;
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
  summary?: any; // Portable text array
  body?: unknown;
}

export interface FavoriteCategory {
  _id: string;
  title: string;
}

export interface Favorite {
  _id: string;
  name: string;
  description?: any; // Portable text array
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
  description?: any; // Portable text array
  link?: string;
  _updatedAt?: string;
  category?: ToolCategory | null;
}

export interface WriteupEntryRef {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt?: string;
}

export interface Writeup {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  entryCount?: number;
  entries?: WriteupEntryRef[];
}

export interface WriteupEntry {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt?: string;
  coverImage?: {
    asset: { _ref: string; _type: string };
  };
  body?: any; // Portable text array
  writeup?: {
    title: string;
    slug: { current: string };
  };
}
