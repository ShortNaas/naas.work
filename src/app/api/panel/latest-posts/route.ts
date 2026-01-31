import { NextResponse } from "next/server";
import { client } from "@/lib/sanity/client";
import { latestPostsQuery } from "@/lib/sanity/queries";

type LatestPost = {
  _id: string;
  title: string;
  url: string;
};

export async function GET() {
  try {
    const posts = await client.fetch<LatestPost[]>(latestPostsQuery);
    return NextResponse.json(posts ?? []);
  } catch (error) {
    console.error("Latest posts panel error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

