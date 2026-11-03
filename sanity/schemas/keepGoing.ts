import { defineField, defineType } from "sanity";
import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";

export const keepGoing = defineType({
  name: "keepGoing",
  title: "Keep Going",
  type: "document",
  fields: [
    defineField({
      name: "mediaType",
      type: "string",
      title: "Type",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
          { title: "GIF", value: "gif" },
        ],
        layout: "radio",
      },
      initialValue: "image",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      type: "image",
      title: "Upload Image / GIF",
      options: { hotspot: true },
      hidden: ({ document }) => document?.mediaType === "video",
    }),
    defineField({
      name: "video",
      type: "file",
      title: "Upload Video",
      options: {
        accept: "video/*",
      },
      hidden: ({ document }) => document?.mediaType !== "video",
    }),
    orderRankField({ type: "keepGoing", hidden: true }),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: {
      mediaType: "mediaType",
      image: "image",
    },
    prepare({ mediaType, image }) {
      const typeLabel =
        mediaType === "video"
          ? "Video"
          : mediaType === "gif"
          ? "GIF"
          : "Image";
      return {
        title: typeLabel,
        media: image,
      };
    },
  },
});
