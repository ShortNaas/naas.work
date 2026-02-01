# naas.work

Personal site: blog, projects, books, milestones, and custom pages. Built with Next.js and Sanity CMS.

## Tech

- **Next.js** (App Router) + **Tailwind CSS**
- **Sanity** for content (posts, projects, books, milestones, pages, site settings)
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
- `/milestones` — Milestones timeline
- `/about` — About (full bio + links from Site Settings)
- `/contact` — Contact links
- `/[slug]` — Custom pages from Sanity (reserved: blog, books, projects, about, contact, milestones, studio, api)

## Project structure

- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — Layout (sidebar, topbar, footer), right panel, search, theme toggle, etc.
- `src/lib/sanity/` — Sanity client, queries, types, image URL helper
- `sanity/` — Sanity config and schemas (post, project, projectKind, page, book, milestone, siteSettings)
