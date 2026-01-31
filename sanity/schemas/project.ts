import { defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project",
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
      name: "image",
      type: "image",
      title: "Image",
      options: { hotspot: true },
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Short description",
    }),
    defineField({
      name: "link",
      type: "url",
      title: "Link",
    }),
    defineField({
      name: "kind",
      type: "array",
      title: "Kind",
      description: "Add one or more kinds (e.g. Software, Book). Existing kinds are suggested; you can create new ones.",
      of: [
        {
          type: "reference",
          to: [{ type: "projectKind" }],
          weak: true,
        },
      ],
    }),
  ],
});