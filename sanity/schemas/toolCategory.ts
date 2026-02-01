import { defineField, defineType } from "sanity";

export const toolCategory = defineType({
  name: "toolCategory",
  title: "Tool Category",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Label",
      description: "e.g. Editor, CLI, Browser, Design",
      validation: (Rule) => Rule.required(),
    }),
  ],
});
