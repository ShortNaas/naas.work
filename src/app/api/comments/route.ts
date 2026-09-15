import { NextResponse } from "next/server";
import { insertComment, isCommentsConfigured } from "@/lib/comments";

const MAX_NAME = 80;
const MAX_EMAIL = 200;
const MAX_BODY = 5000;

/** Reject obviously bogus addresses without pretending to be a validator. */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= MAX_EMAIL;
}

export async function POST(request: Request) {
  if (!isCommentsConfigured()) {
    return NextResponse.json(
      { message: "Comments are not configured yet." },
      { status: 503 }
    );
  }

  try {
    const payload = await request.json();
    const postSlug =
      typeof payload?.postSlug === "string" ? payload.postSlug.trim() : "";
    const authorName =
      typeof payload?.authorName === "string" ? payload.authorName.trim() : "";
    const email = typeof payload?.email === "string" ? payload.email.trim() : "";
    const body = typeof payload?.body === "string" ? payload.body.trim() : "";

    // Honeypot: a real person never fills a field they cannot see.
    if (typeof payload?.website === "string" && payload.website.trim() !== "") {
      // Pretend it worked so the bot does not retry.
      return NextResponse.json({ ok: true, pending: true });
    }

    if (!postSlug.startsWith("/") || postSlug.length > 300) {
      return NextResponse.json({ message: "Invalid post." }, { status: 400 });
    }
    if (!authorName || authorName.length > MAX_NAME) {
      return NextResponse.json(
        { message: `Name is required (max ${MAX_NAME} characters).` },
        { status: 400 }
      );
    }
    if (!looksLikeEmail(email)) {
      return NextResponse.json(
        { message: "A valid email address is required." },
        { status: 400 }
      );
    }
    if (body.length < 2 || body.length > MAX_BODY) {
      return NextResponse.json(
        { message: `Comment is required (max ${MAX_BODY} characters).` },
        { status: 400 }
      );
    }

    const result = await insertComment({ postSlug, authorName, email, body });
    if (!result.ok) {
      return NextResponse.json(
        { message: "Could not save your comment. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, pending: true });
  } catch (error) {
    console.error("Comment POST error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
