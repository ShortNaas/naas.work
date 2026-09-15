import { defineField, defineType } from "sanity";

/**
 * Image that can be dropped into any rich-text body.
 *
 * Declared once and reused by post, page, book, favorite, tool, logsEntry and
 * siteSettings rather than repeating the field config in each schema with
 * `insertMenu: { insert: { image: true } }`, which only allows bare images with
 * no alt text or caption.
 */
export const bodyImage = defineType({
  name: "bodyImage",
  title: "Image",
  type: "object",
  fields: [
    defineField({
      name: "image",
      type: "image",
      title: "Image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "alt",
      type: "string",
      title: "Alt text",
      description:
        "Describe the image for screen readers and for anyone whose images fail to load.",
      // A warning, not an error: it flags the omission in the Studio without
      // blocking a publish.
      validation: (Rule) =>
        Rule.max(200).warning("A short description helps accessibility."),
    }),
    defineField({
      name: "caption",
      type: "string",
      title: "Caption",
      description: "Optional. Shown under the image.",
      validation: (Rule) => Rule.max(300),
    }),
  ],
  preview: {
    select: { title: "caption", subtitle: "alt", media: "image" },
    prepare({ title, subtitle, media }) {
      return {
        title: title || subtitle || "Image",
        subtitle: title ? subtitle : undefined,
        media,
      };
    },
  },
});
