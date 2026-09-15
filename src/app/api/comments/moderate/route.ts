import { NextResponse } from "next/server";
import { deleteComment, getAllComments, setCommentApproved } from "@/lib/comments";
import { isAuthorizedRequest } from "@/lib/comments-auth";

/** Moderation actions. Requires the admin cookie or x-admin-token header. */
export async function POST(request: Request) {
  if (!isAuthorizedRequest(request)) {
    return NextResponse.json({ message: "Not authorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = Number(body?.id);
    const action = typeof body?.action === "string" ? body.action : "";

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ message: "Invalid id." }, { status: 400 });
    }

    if (action === "approve") {
      await setCommentApproved(id, true);
    } else if (action === "unapprove") {
      await setCommentApproved(id, false);
    } else if (action === "delete") {
      await deleteComment(id);
    } else {
      return NextResponse.json({ message: "Unknown action." }, { status: 400 });
    }

    return NextResponse.json({ ok: true, comments: await getAllComments() });
  } catch (error) {
    console.error("Comment moderation error:", error);
    return NextResponse.json({ message: "Action failed." }, { status: 500 });
  }
}
