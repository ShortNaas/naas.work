import { defineField, defineType } from "sanity";

export const projectKind = defineType({
  name: "projectKind",
  title: "Project Kind",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Label",
      validation: (Rule) => Rule.required(),
    }),
  ],
});
