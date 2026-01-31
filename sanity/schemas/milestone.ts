import { defineField, defineType } from "sanity";

export const milestone = defineType({
  name: "milestone",
  title: "Milestone",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", title: "Title" }),
    defineField({ name: "date", type: "date", title: "Date" }),
    defineField({
      name: "note",
      type: "text",
      title: "Short note",
    }),
    defineField({
      name: "category",
      type: "string",
      title: "Category",
      options: {
        list: [
          { title: "Career", value: "career" },
          { title: "Personal", value: "personal" },
          { title: "Learning", value: "learning" },
          { title: "Other", value: "other" },
        ],
      },
    }),
  ],
});