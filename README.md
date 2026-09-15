# naas.work

Personal site: blog, projects, books, and custom pages. Built with Next.js and Sanity CMS.

## Tech

- **Next.js** (App Router) + **Tailwind CSS**
- **Sanity** for content (posts, projects, books, pages, site settings)
- **next-themes** for light/dark mode (default: dark)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Sanity Studio

Content is edited in Sanity Studio, embedded at:

**[/studio](http://localhost:3000/studio)**

Configure CORS for your Studio URL in [sanity.io/manage](https://sanity.io/manage) (Project → API → CORS origins) so the embedded Studio can connect.

## On-demand revalidation (Vercel)

When you publish content in Studio, the deployed site can stay cached. To refresh the site on publish:

1. **Set a secret in Vercel**  
   In your Vercel project → Settings → Environment Variables, add:
   - **Name:** `SANITY_REVALIDATE_SECRET`
   - **Value:** a long random string (e.g. `openssl rand -hex 32`)

2. **Create a webhook in Sanity**  
   In [sanity.io/manage](https://sanity.io/manage) → your project → **API** → **Webhooks** → **Create webhook**:
   - **Name:** e.g. `Vercel revalidate`
   - **URL:** `https://your-domain.vercel.app/api/revalidate`
   - **Trigger on:** Create, Update, Delete (or the events you care about)
   - **Projection:** leave empty (or use `{ _id, _type }` if you only need minimal payload)
   - **HTTP method:** POST
   - **API version:** 2024-01-01 (or your API version)
   - **HTTP headers:** Add a header so the route can verify the request:
     - **Name:** `Authorization`
     - **Value:** `Bearer <same-value-as-SANITY_REVALIDATE_SECRET>`

3. **Redeploy** so the new env var is available.

After that, each time you create, update, or delete a document in Studio, Sanity calls `/api/revalidate` and Next.js invalidates the cache so the next request shows fresh content.

## Analytics (GoatCounter)

The site ships no analytics, ad, or tracking scripts by default. Analytics is
[GoatCounter](https://www.goatcounter.com) — EUPL-licensed, cookie-free, and it
stores no personal data, so no consent banner is needed.

It stays completely off until you configure it. Set:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_GOATCOUNTER_CODE` | Your site code — the `YOURCODE` in `https://YOURCODE.goatcounter.com`. Turns the counter on. |
| `GOATCOUNTER_API_TOKEN` | Optional. A read-only token from *Settings → API*, used server-side to power the blog **popular** sort. Without it, popular falls back to date order. |
| `NEXT_PUBLIC_GOATCOUNTER_URL` | Optional. Point at a self-hosted instance instead of goatcounter.com. |

With none of these set, no analytics request is made at all.

The site code is public by design (it is the subdomain in the script URL), so
`NEXT_PUBLIC_` is appropriate and no secret is exposed. `GOATCOUNTER_API_TOKEN`
is a real secret and must stay server-side.

Note: the counter is mounted in the root layout, so `/studio` visits are
counted too. Exclude that path in GoatCounter's settings if it bothers you.

Fonts are a system stack — no webfont is downloaded and nothing is requested
from a font CDN at build or run time.

## Comments

Blog comments are stored in Postgres (Neon) and held for moderation.

1. **Create a database** at [neon.tech](https://neon.tech) (free tier is plenty).
2. **Set environment variables** in Vercel and `.env.local`:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled connection string from the Neon dashboard. Without it, comments are disabled and the rest of the site works normally. |
| `COMMENTS_ADMIN_SECRET` | A long random string (`openssl rand -hex 32`). Unlocks moderation. |

The `comments` table is created automatically on first use — there is no migration to run.

**Moderating.** Sign in by POSTing the secret once, then use the dashboard:

```bash
curl -X POST https://your-domain/api/comments/admin \
  -H 'Content-Type: application/json' \
  -d '{"secret":"YOUR_COMMENTS_ADMIN_SECRET"}'
```

That sets an httpOnly cookie; visit `/admin/comments` afterwards to approve, unapprove, or delete. The secret is sent in a request body, never a query string, so it stays out of access logs and browser history. The page returns 404 when not signed in.

Comments only appear on the site once approved. New comments are protected by a hidden honeypot field and per-field length limits.

## Scripts

| Command      | Description              |
| ------------ | ------------------------ |
| `npm run dev`   | Start dev server         |
| `npm run build` | Production build         |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

## Main routes

- `/` — Home (hero + short bio from Site Settings)
- `/blog` — Blog list; `/blog/[slug]` — Post (with Contents + Recently Updated in right panel)
- `/projects` — Projects: bullet list, `#hashtag` filters, pinned + manually ordered
- `/books` — Books list; `/books/[slug]` — Book detail
- `/about` — About (full bio + links from Site Settings)
- `/contact` — Contact links
- `/favorite` — My Favorite Things (grouped by category)
- `/uses` — Tools I use (grouped by category). `/tools` 301-redirects here.
- `/logs` — Logs index; `/logs/[slug]` — collection; `/logs/[slug]/[entrySlug]` — entry
- `/[slug]` — Custom pages from Sanity (reserved: admin, blog, books, projects, favorite, uses, logs, about, contact, studio, api)
- `/rss.xml` — RSS 2.0 feed for the blog
- `/admin/comments` — Comment moderation (see below)

## Project structure

- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — Layout (sidebar, topbar, footer), right panel, search, list/filter views
- `src/lib/sanity/` — Sanity client, queries, types, image URL helper
- `sanity/` — Sanity config and schemas (post, project, projectKind, page, book, siteSettings, favorite, favoriteCategory, tool, toolCategory, logs, logsEntry)

## Ordering and pinning projects

Both controls live on each Project document:

- **Pin to top** — pinned projects always sort above unpinned ones.
- **Manual order** — a sort index; lower numbers come first.

In the Studio sidebar, **Projects (drag to reorder)** gives drag-and-drop
ordering (it writes the same rank the site reads). The other document types are
listed below it.

## Theme and fonts

The site is dark-only (base surface `#111111`). There is no light mode, no
runtime theme switcher, and `next-themes` is not a dependency.

Typography uses a system font stack, so no webfont is downloaded and nothing is
requested from Google Fonts at build or run time. `--font-sans` / `--font-heading`
in `src/app/globals.css` are the single place to swap in a self-hosted face.
