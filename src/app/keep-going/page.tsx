import type { Metadata } from "next";
import { client } from "@/lib/sanity/client";
import { keepGoingQuery } from "@/lib/sanity/queries";
import type { KeepGoingItem } from "@/lib/sanity/types";
import { KeepGoingGallery } from "@/components/keep-going-gallery";

export const metadata: Metadata = {
  title: "Keep Going",
  description:
    "A collection of images, reminders, and videos to help you keep going.",
};

export const dynamic = "force-dynamic";

async function getKeepGoingItems(): Promise<KeepGoingItem[]> {
  try {
    const rawItems = await client.fetch<KeepGoingItem[]>(
      keepGoingQuery,
      {},
      { cache: "no-store" }
    );
    return (rawItems ?? []).map((item, idx) => {
      const num = String(idx + 1).padStart(2, "0");
      const ext = item.mediaType === "video" ? "mp4" : "webp";
      return {
        ...item,
        itemNumber: idx + 1,
        localUrl: `/keep-going/${num}.${ext}?v=${item._id}`,
      };
    });
  } catch (error) {
    console.error("Error fetching keep going items:", error);
    return [];
  }
}

export default async function KeepGoingPage() {
  const items = await getKeepGoingItems();

  return <KeepGoingGallery items={items} />;
}
