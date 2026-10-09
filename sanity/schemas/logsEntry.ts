import { defineField, defineType } from "sanity";
import { proseOf } from "./shared";

export const logsEntry = defineType({
  name: "logsEntry",
  title: "Logs Entry",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: 'e.g. "Level 0", "Level 1 → Level 2"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      title: "Published at",
    }),
    defineField({
      name: "coverImage",
      type: "image",
      title: "Cover image",
      options: { hotspot: true },
    }),
    defineField({
      name: "body",
      type: "array",
      title: "Body",
      of: proseOf(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "publishedAt",
      media: "coverImage",
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle
          ? new Date(subtitle).toISOString().slice(0, 10)
          : "No date",
        media,
      };
    },
  },
});
