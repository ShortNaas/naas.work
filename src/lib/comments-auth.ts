import { createHash, timingSafeEqual } from "crypto";

const COOKIE_NAME = "comments_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

/**
 * Derives the session token from the secret, so the cookie never contains the
 * secret itself and cannot be replayed against anything else.
 */
export function getAdminToken(secret: string): string {
  return createHash("sha256").update(`comments-admin:${secret}`).digest("hex");
}

/** Constant-time comparison, so the token cannot be guessed byte by byte. */
export function verifyAdminToken(secret: string, token: string): boolean {
  if (!token) return false;
  const expected = Buffer.from(getAdminToken(secret), "utf8");
  const provided = Buffer.from(token, "utf8");
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(expected, provided);
}

/**
 * Gate for the moderation endpoints. The secret is sent in a header rather than
 * a query string so it does not end up in access logs or browser history.
 */
export function isAuthorizedRequest(request: Request): boolean {
  const secret = process.env.COMMENTS_ADMIN_SECRET;
  if (!secret) return false;

  const headerToken = request.headers.get("x-admin-token");
  if (headerToken && verifyAdminToken(secret, headerToken)) return true;

  // Fall back to the cookie so the moderation page itself can read data.
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  const cookieToken = match?.slice(COOKIE_NAME.length + 1);
  return cookieToken ? verifyAdminToken(secret, cookieToken) : false;
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  };
}

export { COOKIE_NAME };
