import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "heroTitle", type: "string", title: "Hero title" }),
    defineField({
      name: "heroSubtitle",
      type: "string",
      title: "Hero subtitle",
    }),
    defineField({
      name: "shortBio",
      type: "text",
      title: "Short bio (homepage)",
    }),
    defineField({
      name: "fullBio",
      type: "array",
      title: "Full bio (about page)",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "avatar",
      type: "image",
      title: "Avatar",
      options: { hotspot: true },
    }),
    defineField({
      name: "links",
      type: "array",
      title: "Links",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Label" },
            { name: "url", type: "url", title: "URL" },
          ],
        },
      ],
    }),
  ],
});