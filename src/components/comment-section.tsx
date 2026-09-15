import { getApprovedComments, isCommentsConfigured } from "@/lib/comments";
import { CommentForm } from "@/components/comment-form";

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

/**
 * Server-rendered so approved comments are in the HTML (no client fetch, and
 * they are indexable). The form itself is a client component.
 */
export async function CommentSection({ postSlug }: { postSlug: string }) {
  const configured = isCommentsConfigured();
  const comments = configured ? await getApprovedComments(postSlug) : [];

  return (
    <section
      aria-label="Comments"
      className="mt-12 border-t border-[var(--main-border-color)] pt-8"
    >
      <h2 className="mb-4 text-lg font-semibold text-[color:var(--heading-color)]">
        {comments.length > 0
          ? `${comments.length} comment${comments.length === 1 ? "" : "s"}`
          : "Comments"}
      </h2>

      {comments.length > 0 && (
        <ul className="mb-8 list-none space-y-5 p-0 m-0">
          {comments.map((c) => (
            <li key={c.id} className="border-l-2 border-[var(--main-border-color)] pl-4">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-semibold text-[color:var(--heading-color)]">
                  {c.author_name}
                </span>
                <time
                  dateTime={c.created_at}
                  className="text-xs text-[color:var(--text-muted-color)]"
                >
                  {formatDate(c.created_at)}
                </time>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-[color:var(--text-color)]">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      {configured ? (
        <>
          <h3 className="mb-3 text-base font-semibold text-[color:var(--heading-color)]">
            Leave a comment
          </h3>
          <CommentForm postSlug={postSlug} />
        </>
      ) : (
        <p className="text-sm text-[color:var(--text-muted-color)]">
          Comments are not configured yet.
        </p>
      )}
    </section>
  );
}
