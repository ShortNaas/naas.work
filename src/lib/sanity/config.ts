/**
 * Shared project coordinates.
 *
 * These live in their own module so the image URL helper can build CDN URLs
 * without importing the Sanity client. Importing the client here would pull the
 * whole `@sanity/client` runtime into any bundle that touches `urlFor`, and
 * `portable-text.tsx` (a client component) does exactly that.
 */
export const projectId = "ouskx1kr";
export const dataset = "production";
