import { NextResponse } from "next/server";
import { getViewCounts } from "@/lib/views";

export async function GET() {
  const counts = await getViewCounts();
  return NextResponse.json(counts);
}
