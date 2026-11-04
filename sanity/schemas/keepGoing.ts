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
      imageFilename: "image.asset.originalFilename",
      videoFilename: "video.asset.originalFilename",
      createdAt: "_createdAt",
    },
    prepare({
      mediaType,
      image,
      imageFilename,
      videoFilename,
      createdAt,
    }: {
      mediaType?: string;
      image?: unknown;
      imageFilename?: string;
      videoFilename?: string;
      createdAt?: string;
    }) {
      const typeLabel =
        mediaType === "video"
          ? "Video"
          : mediaType === "gif"
          ? "GIF"
          : "Image";
      const filename = imageFilename || videoFilename;
      const dateStr = createdAt
        ? new Date(createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })
        : "";

      return {
        title: filename || typeLabel,
        subtitle: filename ? `${typeLabel} · ${dateStr}` : dateStr,
        media: image,
      };
    },
  },
});
