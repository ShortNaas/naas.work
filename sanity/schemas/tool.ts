import { defineField, defineType } from "sanity";

export const tool = defineType({
  name: "tool",
  title: "Tool",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Name",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      type: "reference",
      title: "Category",
      description: "Add new categories in Tool Category.",
      to: [{ type: "toolCategory" }],
    }),
    defineField({
      name: "description",
      type: "array",
      title: "Short description",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "link",
      type: "url",
      title: "Link or location",
    }),
  ],
});
