import { getApprovedComments, isCommentsConfigured } from "@/lib/comments";
import { formatDateYYYYMMDD } from "@/lib/format-date";
import { CommentForm } from "@/components/comment-form";

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
      {/* The form comes first, then the existing comments below it. */}
      {configured ? (
        <>
          <h2 className="mb-4 text-lg font-semibold text-[color:var(--heading-color)]">
            Leave a comment
          </h2>
          <div className="mb-10">
            <CommentForm postSlug={postSlug} />
          </div>
        </>
      ) : (
        <p className="mb-10 text-sm text-[color:var(--text-muted-color)]">
          Comments are not configured yet.
        </p>
      )}

      {comments.length > 0 && (
        <>
          <h2 className="mb-4 text-lg font-semibold text-[color:var(--heading-color)]">
            {comments.length} comment{comments.length === 1 ? "" : "s"}
          </h2>
          <ul className="list-none space-y-5 p-0 m-0">
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
                    {formatDateYYYYMMDD(c.created_at)}
                  </time>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-[color:var(--text-color)]">
                  {c.body}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
