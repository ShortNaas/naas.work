import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getAllComments, isCommentsConfigured } from "@/lib/comments";
import { COOKIE_NAME, verifyAdminToken } from "@/lib/comments-auth";
import { CommentsModeration } from "@/components/comments-moderation";

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage() {
  const secret = process.env.COMMENTS_ADMIN_SECRET;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  // Returns 404 rather than 401 so the route is not advertised.
  if (!secret || !token || !verifyAdminToken(secret, token)) {
    notFound();
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
