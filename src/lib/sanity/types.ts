export interface SiteSettings {
  heroTitle?: string;
  heroSubtitle?: string;
  shortBio?: string;
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
  description?: string;
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
  summary?: string;
  body?: unknown;
}

export interface Milestone {
  _id: string;
  title: string;
  date: string;
  note?: string;
  category?: string;
}

export interface FavoriteCategory {
  _id: string;
  title: string;
}

export interface Favorite {
  _id: string;
  name: string;
  description?: string;
  link?: string;
  image?: {
    asset: {
      _ref: string;
      _type: string;
    };
  };
  category?: FavoriteCategory | null;
}
