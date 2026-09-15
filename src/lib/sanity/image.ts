import { createImageUrlBuilder } from "@sanity/image-url";
import { dataset, projectId } from "./config";

/*
 * Built from the project coordinates rather than the Sanity client. Passing the
 * client here would make every module that builds an image URL — including
 * `portable-text.tsx`, which runs in the browser — pull in the whole
 * `@sanity/client` runtime (~120 KB) for nothing.
 */
const builder = createImageUrlBuilder({ projectId, dataset });

export function urlFor(source: unknown) {
  return builder.image(source as never);
}

/**
 * Dimensions for an inline (in-body) image. The Sanity document only carries an
 * asset reference here, not its metadata, so this assumes a sensible ratio
 * rather than requesting the asset just to measure it.
 */
export function inlineImageDimensions(aspect = 16 / 9): {
  width: number;
  height: number;
} {
  const width = 1600;
  return { width, height: Math.max(1, Math.round(width / aspect)) };
}

/**
 * Build a Sanity CDN URL that is already the right size for its slot, plus a
 * matching `srcSet`, so a phone does not download the desktop-sized file.
 *
 * Sanity's image pipeline resizes on the fly, so this gets correct image
 * delivery without routing bytes through a proprietary image proxy.
 */
export function responsiveImage(
  source: unknown,
  opts: { width: number; height: number; quality?: number }
) {
  const { width, height, quality = 80 } = opts;
  const build = (w: number, h: number) =>
    urlFor(source).width(w).height(h).quality(quality).fit("crop").auto("format").url();

  const halfWidth = Math.round(width / 2);
  const halfHeight = Math.round(height / 2);

  return {
    src: build(width, height),
    srcSet: [
      `${build(halfWidth, halfHeight)} ${halfWidth}w`,
      `${build(width, height)} ${width}w`,
      `${build(width * 2, height * 2)} ${width * 2}w`,
    ].join(", "),
    width,
    height,
  };
}
