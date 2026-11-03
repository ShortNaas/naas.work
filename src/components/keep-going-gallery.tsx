"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { KeepGoingItem } from "@/lib/sanity/types";

// Matrix of columns: [mobile (<640px), tablet (640-1024px), desktop (>=1024px)]
// Zoom levels 0 (most columns / smallest items) to 3 (fewest columns / largest items)
const COLUMN_MATRIX = [
  [2, 4, 6], // Zoom 0: dense
  [2, 3, 4], // Zoom 1: medium
  [1, 2, 3], // Zoom 2: default
  [1, 1, 2], // Zoom 3: large
];

function VideoCard({ item }: { item: KeepGoingItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoSrc =
    item.localUrl || item.video?.asset?.url || item.videoFile?.asset?.url;

  if (!videoSrc) return null;

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Keep going video ${item.itemNumber || ""}`.trim()}
      className="group relative cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 bg-[var(--card-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--link-color)]"
      onClick={togglePlay}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          togglePlay();
        }
      }}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        aria-label={`Keep going video ${item.itemNumber || ""}`.trim()}
        className="w-full h-auto block rounded-lg"
        preload="metadata"
        playsInline
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {!isPlaying && (
        <button
          type="button"
          aria-label="Play video"
          className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 pointer-events-none shadow-lg border border-white/20"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-0.5">
            <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86A1 1 0 008 5.14z" />
          </svg>
        </button>
      )}
    </div>
  );
}

function ImageCard({ item }: { item: KeepGoingItem }) {
  const imgSrc = item.localUrl || item.image?.asset?.url;
  if (!imgSrc) return null;

  const dimensions = item.image?.asset?.metadata?.dimensions;
  const width = dimensions?.width || 800;
  const height = dimensions?.height || 800;

  return (
    <a
      href={item.localUrl || imgSrc}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 bg-[var(--card-bg)] cursor-pointer"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={`Keep going ${item.itemNumber || ""}`.trim()}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className="w-full h-auto rounded-lg block object-cover"
      />
    </a>
  );
}

export function KeepGoingGallery({ items }: { items: KeepGoingItem[] }) {
  const [zoomIndex, setZoomIndex] = useState(2);
  const [breakpointIndex, setBreakpointIndex] = useState(2);

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      setBreakpointIndex(width >= 1024 ? 2 : width >= 640 ? 1 : 0);
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  const colCount = COLUMN_MATRIX[zoomIndex][breakpointIndex];

  // Distribute items into columns using shortest-column greedy balancing
  const columns: { height: number; items: KeepGoingItem[] }[] = Array.from(
    { length: colCount },
    () => ({ height: 0, items: [] })
  );

  for (const item of items) {
    let ratio = 1;
    if (item.mediaType === "video") {
      ratio = 9 / 16;
    } else if (item.image?.asset?.metadata?.dimensions) {
      const { width, height } = item.image.asset.metadata.dimensions;
      ratio = height / width;
    }

    const shortestCol = columns.reduce((min, col) =>
      col.height < min.height ? col : min
    );
    shortestCol.items.push(item);
    shortestCol.height += ratio;
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8 max-w-7xl mx-auto">
      {/* Header with main site breadcrumb design & zoom controls */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <nav
          id="breadcrumb"
          aria-label="Breadcrumb"
          className="flex items-center gap-1 text-base text-[color:var(--text-muted-color)]"
        >
          <Link
            href="/"
            className="text-[color:var(--link-color)] hover:underline shrink-0"
          >
            Home
          </Link>
          <span className="opacity-60 shrink-0">›</span>
          <span aria-current="page" className="truncate text-[color:var(--heading-color)]">
            Keep Going
          </span>
        </nav>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoomIndex((z) => Math.max(0, z - 1))}
            disabled={zoomIndex === 0}
            aria-label="Zoom out"
            title="Zoom out"
            className="p-2 pointer-coarse:p-3 pointer-coarse:min-w-[44px] pointer-coarse:min-h-[44px] inline-flex items-center justify-center rounded-md text-[color:var(--text-muted-color)] hover:text-[color:var(--heading-color)] hover:bg-[var(--sidebar-hover-bg)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M6.75 8.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" />
              <path
                fillRule="evenodd"
                d="M9 2a7 7 0 104.391 12.452l3.329 3.328a.75.75 0 101.06-1.06l-3.328-3.329A7 7 0 009 2zM3.5 9a5.5 5.5 0 1111 0 5.5 5.5 0 01-11 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setZoomIndex((z) => Math.min(3, z + 1))}
            disabled={zoomIndex === 3}
            aria-label="Zoom in"
            title="Zoom in"
            className="p-2 pointer-coarse:p-3 pointer-coarse:min-w-[44px] pointer-coarse:min-h-[44px] inline-flex items-center justify-center rounded-md text-[color:var(--text-muted-color)] hover:text-[color:var(--heading-color)] hover:bg-[var(--sidebar-hover-bg)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M9 6a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 019 6z" />
              <path
                fillRule="evenodd"
                d="M9 2a7 7 0 104.391 12.452l3.329 3.328a.75.75 0 101.06-1.06l-3.328-3.329A7 7 0 009 2zM3.5 9a5.5 5.5 0 1111 0 5.5 5.5 0 01-11 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Grid: renders items if present, cleanly empty if none */}
      {items.length > 0 && (
        <div className="flex gap-4 items-start">
          {columns.map((col, idx) => (
            <div key={idx} className="flex-1 min-w-0 flex flex-col gap-4">
              {col.items.map((item) =>
                item.mediaType === "video" ? (
                  <VideoCard key={item._id} item={item} />
                ) : (
                  <ImageCard key={item._id} item={item} />
                )
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer Note */}
      <footer className="mt-16 mb-12 text-center space-y-3">
        <p className="text-xs text-[color:var(--text-muted-color)] italic">
          the keep going directory on my computer
        </p>
        <p className="text-xs text-[color:var(--text-muted-color)] opacity-70">
          inspired by{" "}
          <a
            href="https://www.jackfriks.com/keep-going"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[color:var(--link-color)] transition-colors"
          >
            jackfriks
          </a>
        </p>
      </footer>
    </main>
  );
}
