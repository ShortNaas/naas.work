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
}: {
  name: string;
  title: string;
  category: string;
  categoryHint: string;
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
    ],
  });
}
