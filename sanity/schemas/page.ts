import { defineField, defineType } from "sanity";

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  description:
    "Custom pages like Privacy Policy or Books. The slug becomes the URL path (e.g. privacy-policy → /privacy-policy). Don't use slugs that conflict with existing routes: blog, projects, about, contact.",
  fields: [
    defineField({ name: "title", type: "string", title: "Title", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug",
      type: "slug",
      title: "URL slug",
      description: "The path for this page (e.g. privacy-policy → /privacy-policy)",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      type: "array",
      title: "Content",
      of: [
        { type: "block" },
        { type: "bodyImage" },
        { type: "inlineImage" },
      ],
    }),
  ],
});
