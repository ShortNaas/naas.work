import { defineType } from "sanity";

/**
 * Bare image block, kept so bodies authored before `bodyImage` existed still
 * resolve in the Studio. It carries no alt text or caption, so the "Image"
 * type (bodyImage) is what the editor should be used for new content.
 */
export const inlineImage = defineType({
  name: "inlineImage",
  title: "Image (legacy, no alt text)",
  type: "image",
  options: { hotspot: true },
});
