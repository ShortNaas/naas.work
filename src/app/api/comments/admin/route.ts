import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  getAdminCookieOptions,
  getAdminToken,
  verifyAdminToken,
} from "@/lib/comments-auth";

/**
 * Exchanges COMMENTS_ADMIN_SECRET for an httpOnly session cookie.
 *
 * The secret arrives in a POST body, not a query string, so it is not written
 * into access logs, browser history, or Referer headers.
 */
export async function POST(request: Request) {
  const secret = process.env.COMMENTS_ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json(
      { message: "COMMENTS_ADMIN_SECRET is not set." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const provided = typeof body?.secret === "string" ? body.secret : "";
    if (!verifyAdminToken(secret, getAdminToken(provided))) {
      return NextResponse.json({ message: "Invalid secret." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, getAdminToken(secret), getAdminCookieOptions());
    return response;
  } catch {
    return NextResponse.json({ message: "Bad request." }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "", { ...getAdminCookieOptions(), maxAge: 0 });
  return response;
}
