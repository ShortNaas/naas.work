import { defineField, defineType } from "sanity";

export const favoriteCategory = defineType({
  name: "favoriteCategory",
  title: "Favorite Category",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Label",
      description: "e.g. Books, YouTuber, Documentary, Music, Social media",
      validation: (Rule) => Rule.required(),
    }),
  ],
});
