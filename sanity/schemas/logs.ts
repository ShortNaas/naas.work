import { defineField, defineType } from "sanity";

export const logs = defineType({
  name: "logs",
  title: "Logs",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: 'e.g. "OverTheWire: Bandit"',
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
      name: "description",
      type: "text",
      title: "Description",
      description: "A short description of this logs collection.",
      rows: 3,
    }),
    defineField({
      name: "entries",
      type: "array",
      title: "Entries",
      description:
        "Ordered list of logs entries (e.g. Level 0, Level 1 …). Create the entries first, then reference them here.",
      of: [
        {
          type: "reference",
          to: [{ type: "logsEntry" }],
          weak: true,
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
    },
  },
});
