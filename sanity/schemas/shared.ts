import { defineField, defineType } from "sanity";

/** The rich-text field body used by every prose field on the site. */
export function proseOf() {
  return [{ type: "block" }, { type: "bodyImage" }, { type: "inlineImage" }];
}

/** Category documents (project kinds, favorite categories, tool categories). */
export function categoryType(name: string, title: string, description?: string) {
  return defineType({
    name,
    title,
    type: "document",
    fields: [
      defineField({
        name: "title",
        type: "string",
        title: "Label",
        description,
        validation: (Rule) => Rule.required(),
      }),
    ],
  });
}

/** Categorised, linkable list documents (favorites, tools). */
export function listType({
  name,
  title,
  category,
  categoryHint,
  archive = false,
}: {
  name: string;
  title: string;
  category: string;
  categoryHint: string;
  /** Adds the "no longer using" toggle and its optional reason (tools). */
  archive?: boolean;
}) {
  return defineType({
    name,
    title,
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
        description: categoryHint,
        to: [{ type: category }],
      }),
      defineField({
        name: "description",
        type: "array",
        title: "Short description",
        of: proseOf(),
      }),
      defineField({
        name: "link",
        type: "url",
        title: "Link or location",
      }),
      ...(archive
        ? [
            defineField({
              name: "archived",
              type: "boolean",
              title: "No longer using",
              description:
                "Keeps it on the page: struck through, at the bottom of its category, with a badge.",
              initialValue: false,
            }),
            defineField({
              name: "archivedNote",
              type: "string",
              title: "Why I stopped",
              description: "Optional, one line.",
              hidden: ({ document }) => !document?.archived,
              validation: (Rule) => Rule.max(200),
            }),
          ]
        : []),
    ],
    preview: {
      select: { title: "name", category: "category.title", archived: "archived" },
      prepare: ({ title, category, archived }) => ({
        title,
        subtitle:
          [archived ? "No longer using" : null, category]
            .filter(Boolean)
            .join(" · ") || undefined,
      }),
    },
  });
}
