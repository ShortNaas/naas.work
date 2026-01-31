# shortnaas.work

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
