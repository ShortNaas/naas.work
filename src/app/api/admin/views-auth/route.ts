import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  getViewDashboardCookieOptions,
  getViewDashboardToken,
} from "@/lib/view-dashboard-auth";

/** GET with ?key=VIEW_DASHBOARD_SECRET sets the dashboard cookie and redirects to /admin/views (clean URL). */
export async function GET(request: Request) {
  const secret = process.env.VIEW_DASHBOARD_SECRET;
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!secret || key !== secret) {
    return NextResponse.json({ error: "Invalid" }, { status: 404 });
  }

  const token = getViewDashboardToken(secret);
  const response = NextResponse.redirect(new URL("/admin/views", request.url));
  response.cookies.set(COOKIE_NAME, token, getViewDashboardCookieOptions());
  return response;
}
