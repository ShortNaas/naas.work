import { createHmac } from "crypto";

const COOKIE_NAME = "view_dashboard";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

/** Produce a signed token for the view dashboard (derived from secret). */
export function getViewDashboardToken(secret: string): string {
  return createHmac("sha256", secret).update("view-dashboard").digest("hex");
}

/** Check if the given token matches the secret. */
export function verifyViewDashboardToken(secret: string, token: string): boolean {
  return token.length > 0 && getViewDashboardToken(secret) === token;
}

export function getViewDashboardCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  };
}

export { COOKIE_NAME };
