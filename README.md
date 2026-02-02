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

## View counts (optional)

Page views are counted so you can see how many people visit the site and which posts are most visited. The blog list **Sort by: popular** uses these counts.

1. **Add a Redis store**  
   In the [Vercel Marketplace](https://vercel.com/marketplace), add **Upstash Redis** to your project. Environment variables (e.g. `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) are set automatically.

2. **Local dev**  
   Without Redis configured, view counts are skipped (no errors). To test locally, create an Upstash Redis database at [upstash.com](https://upstash.com) and add the same env vars to `.env.local`.

3. **How it works**  
   On each page load, the client calls `POST /api/view` with the current path. Counts are stored in Redis (one key per path). The blog page fetches counts and passes them to `BlogList`, so “popular” sorts by real view counts.

4. **View dashboard (you only)**  
   Set `VIEW_DASHBOARD_SECRET` (e.g. `openssl rand -hex 32`). To sign in, visit `/api/admin/views-auth?key=<your-secret>` once; the app sets a signed cookie and redirects to `/admin/views`. After that, use `/admin/views` (no key in the URL) until the cookie expires (24 hours). Without a valid cookie, the page returns 404.

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
- `/projects` — Projects with tag filters
- `/books` — Books list; `/books/[slug]` — Book detail
- `/about` — About (full bio + links from Site Settings)
- `/contact` — Contact links
- `/favorite` — My Favorite Things (grouped by category)
- `/tools` — Tools I use (grouped by category)
- `/admin/views` — View counts dashboard (sign in once via `/api/admin/views-auth?key=…`; set `VIEW_DASHBOARD_SECRET`)
- `/[slug]` — Custom pages from Sanity (reserved: admin, blog, books, projects, about, contact, studio, api)

## Project structure

- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — Layout (sidebar, topbar, footer), right panel, search, theme toggle, etc.
- `src/lib/sanity/` — Sanity client, queries, types, image URL helper
- `sanity/` — Sanity config and schemas (post, project, projectKind, page, book, siteSettings)
