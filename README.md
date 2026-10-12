# naas.work

Personal site: blog, projects, books, and custom pages. Built with Next.js and Sanity CMS.

## Tech

- **Next.js** (App Router) + **Tailwind CSS**
- **Sanity** for content (posts, projects, books, pages, site settings)
- **Neon Postgres** for comments, **Resend** for the contact form

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

The sidebar groups content by how it is authored:

- **Projects**, **Tools** and **Favorites** list each label (`kind` / `category`)
  as a parent, with `All …` and `Kinds` / `Categories` (create, rename, delete)
  at the end of the group. The `+` inside a label opens the item form with that
  reference already set, so a label is never created elsewhere and linked back
  by hand. Projects keep drag-and-drop ordering in `All projects`.
- **Logs** open to their entries.
- A tool can be marked **No longer using**: it stays on `/uses`, struck through,
  badged and sorted last in its category, with an optional one-line reason.

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

**Moderating.** Visit [`/admin/comments`](https://www.naas.work/admin/comments) and enter `COMMENTS_ADMIN_SECRET` in the sign-in form. That sets an httpOnly session cookie (24 hours), after which the page lists everything awaiting approval so you can approve, unapprove, or delete.

The secret is submitted in a request body, never a query string, so it stays out of access logs and browser history. Comparison is constant-time. Once signed in, all other comment endpoints also accept the cookie.

**If `/admin/comments` will not let you in**, check these in order:

1. `COMMENTS_ADMIN_SECRET` is set for the environment you are visiting (Production vs Preview are separate in Vercel).
2. You **redeployed** after adding it. Environment changes do not apply to an existing deployment.
3. You are entering the secret itself, not the variable name.
4. The page says "COMMENTS_ADMIN_SECRET is not set for this deployment" if the variable is missing — that message means the deploy cannot see it.

Comments need `DATABASE_URL`; moderation needs `COMMENTS_ADMIN_SECRET`. They are independent, so the comment form can work while moderation does not.

Comments only appear on the site once approved. New comments are protected by a hidden honeypot field and per-field length limits.

## Contact form

Submissions are emailed with [Resend](https://resend.com) from `src/app/api/contact/route.ts`, which holds both addresses: the recipient (`CONTACT_EMAIL`) and the default sender.

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Required. Without it the form returns 503 and sends nothing. |
| `RESEND_FROM_EMAIL` | Optional. Overrides the sender; must be an address on a domain verified in Resend. Defaults to `Naas <yo@naas.work>`. |

The visitor's address goes in `replyTo`, so replying answers them rather than the site.

## Scripts

| Command      | Description              |
| ------------ | ------------------------ |
| `npm run dev`   | Start dev server         |
| `npm run build` | Production build         |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |
| `npm test`      | Run the shared-logic self-check |

## Main routes

- `/` — Home (hero + short bio from Site Settings)
- `/blog` — Blog list; `/blog/[slug]` — Post (with Contents + Recently Updated in right panel)
- `/projects` — Projects: bullet list, `#hashtag` filters, pinned + manually ordered
- `/books` — Books list; `/books/[slug]` — Book detail
- `/about` — About (full bio + links from Site Settings)
- `/contact` — Contact links
- `/favorite` — My Favorite Things (grouped by category)
- `/uses` — Tools I use (grouped by category; anything marked *no longer using* is struck through and sorted last). `/tools` 301-redirects here.
- `/logs` — Logs index; `/logs/[slug]` — collection; `/logs/[slug]/[entrySlug]` — entry
- `/[slug]` — Custom pages from Sanity (a slug that collides with a static route above loses to it)
- `/rss.xml` — RSS 2.0 feed for the blog
- `/admin/comments` — Comment moderation (see below)

## Project structure

- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — Layout (sidebar, topbar, footer), right panel, search, list/filter views
- `src/lib/sanity/` — Sanity client, queries, types, image URL helper
- `sanity/` — Sanity config and schemas (post, project, projectKind, page, book, siteSettings, favorite, favoriteCategory, tool, toolCategory, logs, logsEntry)

## Ordering and pinning projects

Two controls:

- **Pin to top** — pinned projects always sort above unpinned ones.
- **Projects (drag to reorder)** in the Studio sidebar gives drag-and-drop
  ordering; it writes the rank the site reads. The other document types are
  listed below it.

## Theme and fonts

The site is dark-only (base surface `#111111`). There is no light mode, no
runtime theme switcher, and `next-themes` is not a dependency.

Typography uses a system font stack, so no webfont is downloaded and nothing is
requested from Google Fonts at build or run time. `--font-sans` / `--font-heading`
in `src/app/globals.css` are the single place to swap in a self-hosted face.

## Design system

Everything visual lives in `src/app/globals.css`: the palette is `:root` custom
properties consumed as arbitrary Tailwind values (`bg-[var(--card-bg)]`). There
is no `tailwind.config` and no second way to express a colour.

- **Roles, not swatches** — canvas (`--background`), elevated surfaces
  (`--card-bg`, `--sidebar-btn-bg`), text (`--foreground`, `--text-color`,
  `--text-muted-color`, `--heading-color`), action (`--link-color`,
  `--accent-bg` / `--accent-fg`), status (`--danger-color`), scrim
  (`--overlay-color`).
- **Layering** — 20 scroll-to-top · 30 sticky topbar · 40 drawer scrim ·
  50 drawer · 60 skip link. The search dialog uses the browser's top layer.
- **Motion** — a reading surface, so nothing enters on page load. The drawer
  (200ms) and the drawer scrim + search panel (150–180ms, exponential ease-out)
  are the only authored moments. `prefers-reduced-motion` removes the movement
  at its source and keeps colour/opacity feedback.
- **Touch** — controls reach 44px through `pointer-coarse:` variants, so pointer
  layouts keep their density.
- **Reachable** — a skip link is the first tab stop, every route sets its own
  title, and the search dialog is a native `<dialog>` (focus trap, Escape and
  focus restore come from the browser).
