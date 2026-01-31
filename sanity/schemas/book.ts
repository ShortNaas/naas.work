import { defineField, defineType } from "sanity";

export const book = defineType({
  name: "book",
  title: "Book",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", title: "Title", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "author", type: "string", title: "Author" }),
    defineField({
      name: "cover",
      type: "image",
      title: "Cover",
      options: { hotspot: true },
    }),
    defineField({ name: "isbn", type: "string", title: "ISBN" }),
    defineField({
      name: "dateRead",
      type: "date",
      title: "Date read",
    }),
    defineField({
      name: "rating",
      type: "number",
      title: "How strongly I recommend it (1–10)",
      validation: (Rule) => Rule.min(1).max(10).integer(),
    }),
    defineField({
      name: "amazonUrl",
      type: "url",
      title: "Amazon page URL",
    }),
    defineField({
      name: "summary",
      type: "text",
      title: "Short summary",
      description: "Shown on the book list page.",
    }),
    defineField({
      name: "body",
      type: "array",
      title: "Review & notes",
      description: "Full review, actionable takeaways, and notes.",
      of: [{ type: "block" }],
    }),
  ],
});
