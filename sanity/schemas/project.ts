import { defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

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
      name: "pinned",
      title: "Pin to top",
      type: "boolean",
      description: "Pinned projects always sort above unpinned ones.",
      initialValue: false,
    }),
    defineField({
      name: "image",
      type: "image",
      title: "Image",
      options: { hotspot: true },
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
    // Managed by drag-and-drop; not meant to be edited by hand.
    orderRankField({ type: "project", hidden: true }),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: { title: "title", pinned: "pinned", media: "image" },
    prepare({ title, pinned, media }) {
      return { title, subtitle: pinned ? "📌 pinned" : undefined, media };
    },
  },
});
