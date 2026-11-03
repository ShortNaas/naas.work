import { defineField, defineType } from "sanity";
import { proseOf } from "./shared";

export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      options: { source: "title", maxLength: 96 },
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
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alt text",
          description: "Describe the image for screen readers and accessibility.",
          validation: (Rule) =>
            Rule.max(200).warning("A short description helps accessibility."),
        }),
      ],
    }),
    defineField({
      name: "body",
      type: "array",
      title: "Body",
      of: proseOf(),
    }),
  ],
});