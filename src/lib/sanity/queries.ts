import { groq } from "next-sanity";

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    heroTitle,
    heroSubtitle,
    shortBio,
    fullBio,
    avatar,
    links
  }
`;

export const postsQuery = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt
  }
`;

export const postSlugsQuery = groq`
  *[_type == "post" && defined(slug.current)].slug.current
`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    publishedAt,
    coverImage,
    body
  }
`;

export const latestPostsQuery = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0..4] {
    _id,
    title,
    "url": "/blog/" + slug.current
  }
`;

export const projectsQuery = groq`
  *[_type == "project" && defined(slug.current)]
    | order(pinned desc, orderRank asc, _createdAt desc) {
    _id,
    title,
    image,
    description,
    link,
    pinned,
    orderRank,
    "kind": kind[]->{ _id, title }
  }
`;

export const favoritesQuery = groq`
  *[_type == "favorite"] | order(_updatedAt desc) {
    _id,
    name,
    description,
    link,
    _updatedAt,
    "category": category->{ _id, title }
  }
`;

export const toolsQuery = groq`
  *[_type == "tool"] | order(_updatedAt desc) {
    _id,
    name,
    description,
    link,
    _updatedAt,
    "category": category->{ _id, title }
  }
`;

export const pageSlugsQuery = groq`
  *[_type == "page" && defined(slug.current)].slug.current
`;

export const pageBySlugQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    body
  }
`;

export const booksQuery = groq`
  *[_type == "book"] | order(dateRead desc) {
    _id,
    title,
    slug,
    author,
    cover,
    dateRead,
    rating,
    summary
  }
`;

export const bookSlugsQuery = groq`
  *[_type == "book" && defined(slug.current)].slug.current
`;

export const bookBySlugQuery = groq`
  *[_type == "book" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    author,
    cover,
    isbn,
    dateRead,
    rating,
    amazonUrl,
    summary,
    body
  }
`;

// ── logs ──────────────────────────────────────────────────────────────────

export const logsQuery = groq`
  *[_type == "logs"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    description,
    "entryCount": count(entries)
  }
`;

export const logsSlugsQuery = groq`
  *[_type == "logs" && defined(slug.current)].slug.current
`;

export const logsBySlugQuery = groq`
  *[_type == "logs" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    "entries": entries[]-> {
      _id,
      title,
      slug,
      publishedAt
    }
  }
`;

export const logsEntrySlugsQuery = groq`
  *[_type == "logs" && defined(slug.current)] {
    "logsSlug": slug.current,
    "entries": entries[]-> {
      "entrySlug": slug.current
    }
  }
`;

export const logsEntryBySlugQuery = groq`
  *[_type == "logsEntry" && slug.current == $entrySlug][0] {
    _id,
    title,
    slug,
    publishedAt,
    coverImage,
    body,
    "logs": *[_type == "logs" && references(^._id)][0] {
      title,
      slug
    }
  }
`;

// Minimal fields for search index (posts + projects).
// Snippets are truncated to keep the payload small: this ships to the browser.
export const searchIndexQuery = groq`
  {
    "posts": *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
      _id,
      _type,
      title,
      "url": "/blog/" + slug.current,
      "snippet": pt::text(body)[0...200]
    },
    "projects": *[_type == "project"] | order(orderRank asc, _createdAt desc) {
      _id,
      _type,
      title,
      "url": coalesce(link, "/projects"),
      "snippet": pt::text(description)[0...200]
    }
  }
`;
