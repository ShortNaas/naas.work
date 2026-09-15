import { cookies } from "next/headers";
import { getAllComments, isCommentsConfigured } from "@/lib/comments";
import { COOKIE_NAME, verifyAdminToken } from "@/lib/comments-auth";
import { CommentsModeration } from "@/components/comments-moderation";
import { CommentsSignIn } from "@/components/comments-sign-in";

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage() {
  const secret = process.env.COMMENTS_ADMIN_SECRET;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const signedIn = Boolean(secret && token && verifyAdminToken(secret, token));

  // No secret configured at all is a setup problem worth naming. Anything else
  // that is not signed in still 404s, so the route is not advertised.
  if (!secret) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-2xl font-semibold text-[color:var(--heading-color)] mb-2">
          Comments
        </h1>
        <p className="text-sm text-[color:var(--text-color)]">
          <code className="text-[color:var(--link-color)]">COMMENTS_ADMIN_SECRET</code>{" "}
          is not set for this deployment, so there is nothing to sign in to.
        </p>
        <p className="mt-3 text-sm text-[color:var(--text-muted-color)]">
          Add it in your hosting provider&apos;s environment variables and
          redeploy — environment changes do not apply to an existing deployment.
        </p>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-2xl font-semibold text-[color:var(--heading-color)] mb-2">
          Comments
        </h1>
        <p className="text-sm text-[color:var(--text-muted-color)] mb-6">
          Sign in to moderate. Without a valid session this page returns 404
          rather than revealing itself.
        </p>
        <CommentsSignIn />
      </div>
    );
  }

  const comments = await getAllComments();

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-[color:var(--heading-color)] mb-2">
        Comments
      </h1>
      <p className="text-sm text-[color:var(--text-muted-color)] mb-6">
        {isCommentsConfigured()
          ? "Approve to publish. Nothing appears on the site until approved."
          : "DATABASE_URL is not set, so comment storage is disabled."}
      </p>
      <CommentsModeration initialComments={comments} />
    </div>
  );
}
