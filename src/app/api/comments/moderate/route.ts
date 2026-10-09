import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  deleteComment,
  getAllComments,
  getCommentPostSlug,
  setCommentApproved,
} from "@/lib/comments";
import { isAuthorizedRequest } from "@/lib/comments-auth";

/** Moderation actions. Requires the admin cookie or x-admin-token header. */
export async function POST(request: Request) {
  if (!(await isAuthorizedRequest(request))) {
    return NextResponse.json({ message: "Not authorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = Number(body?.id);
    const action = typeof body?.action === "string" ? body.action : "";

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ message: "Invalid id." }, { status: 400 });
    }

    // Resolved before the change, since a delete removes the row.
    const postSlug = await getCommentPostSlug(id);

    if (action === "approve") {
      await setCommentApproved(id, true);
    } else if (action === "unapprove") {
      await setCommentApproved(id, false);
    } else if (action === "delete") {
      await deleteComment(id);
    } else {
      return NextResponse.json({ message: "Unknown action." }, { status: 400 });
    }

    /*
     * Post pages are statically rendered, so the comment list is baked into the
     * HTML. Without this, an approved comment would not appear until the next
     * deploy. Revalidating the post's path regenerates just that page.
     */
    if (postSlug) {
      try {
        revalidatePath(postSlug);
      } catch (error) {
        console.error("Revalidate after moderation failed:", error);
      }
    }

    return NextResponse.json({ ok: true, comments: await getAllComments() });
  } catch (error) {
    console.error("Comment moderation error:", error);
    return NextResponse.json({ message: "Action failed." }, { status: 500 });
  }
}
