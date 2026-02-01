import { defineField, defineType } from "sanity";

export const favorite = defineType({
  name: "favorite",
  title: "Favorite",
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
      description: "Books, YouTuber, Documentary, etc. Add new categories in Favorite Category.",
      to: [{ type: "favoriteCategory" }],
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Short description",
    }),
    defineField({
      name: "link",
      type: "url",
      title: "Link or location",
    }),
  ],
});
