import { defineField, defineType } from "sanity";

export const logs = defineType({
  name: "logs",
  title: "Logs",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: 'e.g. "OverTheWire: Bandit"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      description: "A short description of this logs collection.",
      rows: 3,
    }),
    defineField({
      name: "entries",
      type: "array",
      title: "Entries",
      description:
        "Click Add item → Create new to make an entry right here, so you never have to create it first and come back to link it. Drag to reorder.",
      of: [
        {
          type: "reference",
          to: [{ type: "logsEntry" }],
          weak: true,
          // Already-attached entries are filtered out of the picker, so the
          // list only offers entries that are still unassigned.
          options: {
            filter: ({ document }) => {
              const attached = new Set(
                ((document?.entries as Array<{ _ref?: string }> | undefined) ?? [])
                  .map((entry) => entry?._ref)
                  .filter(Boolean) as string[]
              );
              if (attached.size === 0) return { filter: "", params: {} };
              return {
                filter: "!(_id in $attached)",
                params: { attached: [...attached] },
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
    },
  },
});
