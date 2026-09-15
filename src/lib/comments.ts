import { neon } from "@neondatabase/serverless";

/**
 * Comments storage on Neon Postgres (plain Postgres, not a proprietary API).
 *
 * DATABASE_URL is the pooled connection string from the Neon dashboard. While
 * it is unset the site still works: comments read as empty and posting returns
 * a clear 503 instead of throwing.
 *
 * The table is created on first successful connection, so there is no separate
 * migration step to run. `create table if not exists` is idempotent and safe to
 * call from several lambdas at once.
 */

export type Comment = {
  id: number;
  post_slug: string;
  author_name: string;
  body: string;
  created_at: string;
};

export type PendingComment = Comment & {
  email: string;
  approved: boolean;
  created_at: string;
};

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

let schemaReady: Promise<void> | null = null;

async function ensureSchema(sql: NonNullable<ReturnType<typeof getSql>>) {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        create table if not exists comments (
          id          bigserial primary key,
          post_slug   text        not null,
          author_name text        not null,
          email       text        not null,
          body        text        not null,
          approved    boolean     not null default false,
          created_at  timestamptz not null default now()
        )
      `;
      // Listing a post's comments and the moderation queue are the two reads.
      await sql`
        create index if not exists comments_post_slug_approved_idx
          on comments (post_slug, approved, created_at)
      `;
      await sql`
        create index if not exists comments_approved_created_idx
          on comments (approved, created_at desc)
      `;
    })().catch((error) => {
      // Let the next request retry rather than caching a failed init forever.
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

/** Whether comment storage is configured at all. */
export function isCommentsConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Approved comments for one post, oldest first (a natural conversation order). */
export async function getApprovedComments(postSlug: string): Promise<Comment[]> {
  const sql = getSql();
  if (!sql) return [];
  try {
    await ensureSchema(sql);
    const rows = await sql`
      select id, post_slug, author_name, body, created_at
      from comments
      where post_slug = ${postSlug} and approved = true
      order by created_at asc
    `;
    return rows as Comment[];
  } catch (error) {
    console.error("Failed to read comments:", error);
    return [];
  }
}

/** Comment counts for a set of posts, for the "N comments" hint on the list. */
export async function getCommentCounts(
  slugs: string[]
): Promise<Record<string, number>> {
  const sql = getSql();
  if (!sql || slugs.length === 0) return {};
  try {
    await ensureSchema(sql);
    const rows = (await sql`
      select post_slug, count(*)::int as count
      from comments
      where approved = true and post_slug = any(${slugs})
      group by post_slug
    `) as Array<{ post_slug: string; count: number }>;
    return Object.fromEntries(rows.map((r) => [r.post_slug, r.count]));
  } catch (error) {
    console.error("Failed to read comment counts:", error);
    return {};
  }
}

export async function insertComment(input: {
  postSlug: string;
  authorName: string;
  email: string;
  body: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const sql = getSql();
  if (!sql) return { ok: false, reason: "not-configured" };

  try {
    await ensureSchema(sql);
    // Moderation is by design: nothing appears publicly until approved.
    await sql`
      insert into comments (post_slug, author_name, email, body)
      values (${input.postSlug}, ${input.authorName}, ${input.email}, ${input.body})
    `;
    return { ok: true };
  } catch (error) {
    console.error("Failed to insert comment:", error);
    return { ok: false, reason: "insert-failed" };
  }
}

/** Everything awaiting moderation, plus recent approved ones. */
export async function getAllComments(limit = 200): Promise<PendingComment[]> {
  const sql = getSql();
  if (!sql) return [];
  try {
    await ensureSchema(sql);
    const rows = await sql`
      select id, post_slug, author_name, email, body, approved, created_at
      from comments
      order by approved asc, created_at desc
      limit ${limit}
    `;
    return rows as PendingComment[];
  } catch (error) {
    console.error("Failed to read comment queue:", error);
    return [];
  }
}

/** The post a comment belongs to, so its static page can be revalidated. */
export async function getCommentPostSlug(id: number): Promise<string | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    await ensureSchema(sql);
    const rows = (await sql`
      select post_slug from comments where id = ${id} limit 1
    `) as Array<{ post_slug: string }>;
    return rows[0]?.post_slug ?? null;
  } catch (error) {
    console.error("Failed to look up comment:", error);
    return null;
  }
}

export async function setCommentApproved(
  id: number,
  approved: boolean
): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  try {
    await ensureSchema(sql);
    await sql`update comments set approved = ${approved} where id = ${id}`;
    return true;
  } catch (error) {
    console.error("Failed to update comment:", error);
    return false;
  }
}

export async function deleteComment(id: number): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  try {
    await ensureSchema(sql);
    await sql`delete from comments where id = ${id}`;
    return true;
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return false;
  }
}
