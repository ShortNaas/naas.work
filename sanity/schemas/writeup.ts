import { defineField, defineType } from "sanity";

export const writeup = defineType({
  name: "writeup",
  title: "Writeup",
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
      description: "A short description of this writeup collection.",
      rows: 3,
    }),
    defineField({
      name: "entries",
      type: "array",
      title: "Entries",
      description:
        "Ordered list of writeup entries (e.g. Level 0, Level 1 …). Create the entries first, then reference them here.",
      of: [
        {
          type: "reference",
          to: [{ type: "writeupEntry" }],
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
