import { NextResponse } from "next/server";
import { incrementView } from "@/lib/views";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const path = typeof body?.path === "string" ? body.path.trim() : "";

    if (!path || !path.startsWith("/") || path.length > 500) {
      return NextResponse.json(
        { error: "Invalid path" },
        { status: 400 }
      );
    }

    await incrementView(path);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
