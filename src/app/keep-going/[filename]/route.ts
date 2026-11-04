import { client } from "@/lib/sanity/client";
import { groq } from "next-sanity";

export const dynamic = "force-dynamic";

const itemsQuery = groq`
  *[_type == "keepGoing"] | order(orderRank asc, _createdAt asc) {
    _id,
    mediaType,
    "imageUrl": image.asset->url,
    "videoUrl": coalesce(video.asset->url, videoFile.asset->url)
  }
`;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Match e.g. 01.webp, 02.webp, 2.webp, 03.mp4
  const match = filename.match(/^0*(\d+)\.([a-zA-Z0-9]+)$/);
  if (!match) {
    return new Response("Not found", { status: 404 });
  }

  const itemIndex = parseInt(match[1], 10) - 1; // 0-based index
  if (itemIndex < 0) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const items = await client.fetch<
      Array<{
        _id: string;
        mediaType: "image" | "video" | "gif";
        imageUrl?: string;
        videoUrl?: string;
      }>
    >(itemsQuery);

    const item = items[itemIndex];
    if (!item) {
      return new Response("Not found", { status: 404 });
    }

    if (item.mediaType === "video") {
      if (!item.videoUrl) {
        return new Response("Video file not found", { status: 404 });
      }

      // Redirect directly to the CDN so browsers receive native HTTP 206
      // Partial Content byte-range streaming, instant seeking, and edge caching.
      return Response.redirect(item.videoUrl, 307);
    }

    // For images and GIFs: convert to WebP using Sanity's image transformation API
    if (!item.imageUrl) {
      return new Response("Image asset not found", { status: 404 });
    }

    const separator = item.imageUrl.includes("?") ? "&" : "?";
    const webpUrl = `${item.imageUrl}${separator}fm=webp`;

    const upstream = await fetch(webpUrl);
    if (!upstream.ok) {
      return new Response("Error fetching image", {
        status: upstream.status,
      });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        ...(upstream.headers.get("content-length")
          ? { "Content-Length": upstream.headers.get("content-length")! }
          : {}),
      },
    });
  } catch (error) {
    console.error("Error serving keep-going media:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
