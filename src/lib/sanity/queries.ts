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
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    coverImage,
    body
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
  *[_type == "project"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    image,
    description,
    link,
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

export const milestonesQuery = groq`
  *[_type == "milestone"] | order(date desc) {
    _id,
    title,
    date,
    note,
    category
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

// Minimal fields for search index (posts + projects + milestones)
export const searchIndexQuery = groq`
  {
    "posts": *[_type == "post"] | order(publishedAt desc) {
      _id,
      _type,
      title,
      "url": "/blog/" + slug.current,
      "snippet": pt::text(body)
    },
    "projects": *[_type == "project"] | order(_createdAt desc) {
      _id,
      _type,
      title,
      "url": coalesce(link, "/projects"),
      "snippet": description
    },
    "milestones": *[_type == "milestone"] | order(date desc) {
      _id,
      _type,
      title,
      "url": "/milestones",
      "snippet": note
    }
  }
`;
