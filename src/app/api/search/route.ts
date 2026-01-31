import { NextResponse } from "next/server";
import { client } from "@/lib/sanity/client";
import { searchIndexQuery } from "@/lib/sanity/queries";

export type SearchIndexItem = {
  _id: string;
  _type: string;
  title: string;
  url: string;
  snippet?: string;
};

export type SearchIndex = {
  posts: SearchIndexItem[];
  projects: SearchIndexItem[];
  milestones: SearchIndexItem[];
};

export async function GET() {
  try {
    const data = await client.fetch<SearchIndex>(searchIndexQuery);
    return NextResponse.json(data ?? { posts: [], projects: [], milestones: [] });
  } catch (error) {
    console.error("Search index error:", error);
    return NextResponse.json(
      { posts: [], projects: [], milestones: [] },
      { status: 200 }
    );
  }
}
