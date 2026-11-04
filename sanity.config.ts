import { defineConfig, type ConfigContext } from "sanity";
import { structureTool, type StructureBuilder } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { UploadIcon } from "@sanity/icons";

import { post } from "./sanity/schemas/post";
import { project } from "./sanity/schemas/project";
import { projectKind } from "./sanity/schemas/projectKind";
import { page } from "./sanity/schemas/page";
import { book } from "./sanity/schemas/book";
import { siteSettings } from "./sanity/schemas/siteSettings";
import { favorite } from "./sanity/schemas/favorite";
import { favoriteCategory } from "./sanity/schemas/favoriteCategory";
import { tool } from "./sanity/schemas/tool";
import { toolCategory } from "./sanity/schemas/toolCategory";
import { logs } from "./sanity/schemas/logs";
import { logsEntry } from "./sanity/schemas/logsEntry";
import { keepGoing } from "./sanity/schemas/keepGoing";
import { bodyImage } from "./sanity/schemas/bodyImage";
import { inlineImage } from "./sanity/schemas/inlineImage";
import { BatchUploadKeepGoing } from "./sanity/components/BatchUploadKeepGoing";

const API_VERSION = "2024-01-01";

/*
 * Every list that is "an item plus a label" gets the same Studio shape: the
 * label is the parent in the sidebar and the "+" inside it pre-fills the
 * reference, so an item is never created somewhere else and linked back by
 * hand. Projects join in through their multi-valued `kind[]`.
 */
const LIST_SECTIONS = [
  {
    itemType: "project",
    itemLabel: "Project",
    categoryType: "projectKind",
    categoryListLabel: "Kinds",
    // `in` because kind is multi-valued: `kind[]._ref == $id` is always false.
    filter: "$categoryId in kind[]._ref",
    title: "Projects",
    allLabel: "All projects (drag to reorder)",
    templateId: "project-in-kind",
    orderable: true,
    templateValue: (kindId: string) => ({
      kind: [{ _type: "reference", _ref: kindId, _key: kindId }],
    }),
  },
  {
    itemType: "tool",
    itemLabel: "Tool",
    categoryType: "toolCategory",
    categoryListLabel: "Categories",
    filter: "category._ref == $categoryId",
    title: "Tools",
    allLabel: "All tools",
    templateId: "tool-in-category",
    orderable: false,
    templateValue: (categoryId: string) => ({
      category: { _type: "reference", _ref: categoryId },
    }),
  },
  {
    itemType: "favorite",
    itemLabel: "Favorite",
    categoryType: "favoriteCategory",
    categoryListLabel: "Categories",
    filter: "category._ref == $categoryId",
    title: "Favorites",
    allLabel: "All favorites",
    templateId: "favorite-in-category",
    orderable: false,
    templateValue: (categoryId: string) => ({
      category: { _type: "reference", _ref: categoryId },
    }),
  },
] as const;

/** Types that live inside a section (or are reached another way), never loose. */
const NESTED_TYPES = new Set<string>([
  ...LIST_SECTIONS.flatMap((section) => [section.itemType, section.categoryType]),
  "logs",
  "logsEntry",
  "keepGoing",
]);

async function categorySection(
  S: StructureBuilder,
  context: ConfigContext,
  section: (typeof LIST_SECTIONS)[number]
) {
  const client = context.getClient({ apiVersion: API_VERSION });

  // A failed fetch must not take the whole sidebar down with it.
  const categories = await client
    .fetch<{ _id: string; title: string }[]>(
      `*[_type == $type] | order(title asc) { _id, title }`,
      { type: section.categoryType }
    )
    .catch(() => []);

  return S.listItem()
    .title(section.title)
    .child(
      S.list()
        .title(section.title)
        .items([
          ...categories.map((category) => {
            let list = S.documentTypeList(section.itemType)
              .title(category.title)
              .filter(section.filter)
              .params({ categoryId: category._id })
              .initialValueTemplates([
                S.initialValueTemplateItem(section.templateId, {
                  categoryId: category._id,
                }),
              ]);

            // Keep the Studio list in the order the site renders.
            if (section.orderable) {
              list = list.defaultOrdering([{ field: "orderRank", direction: "asc" }]);
            }

            return S.listItem()
              .id(`${section.itemType}-${category._id}`)
              .title(category.title)
              .child(list);
          }),
          ...(categories.length > 0 ? [S.divider()] : []),
          section.orderable
            ? orderableDocumentListDeskItem({
                type: section.itemType,
                title: section.allLabel,
                S,
                context,
              })
            : S.listItem()
                .title(section.allLabel)
                .child(
                  S.documentTypeList(section.itemType).title(section.allLabel)
                ),
          S.listItem()
            .title(section.categoryListLabel)
            .child(
              S.documentTypeList(section.categoryType).title(
                section.categoryListLabel
              )
            ),
        ])
    );
}

export default defineConfig({
  name: "default",
  title: "naas.work",
  projectId: "ouskx1kr",
  dataset: "production",
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: async (S: StructureBuilder, context: ConfigContext) =>
        S.list()
          .title("Content")
          .items([
            ...(await Promise.all(
              LIST_SECTIONS.map((section) =>
                categorySection(S, context, section)
              )
            )),
            S.divider(),
            // Logs list. Open a log and add entries inline through its Entries
            // field, so entries are never mixed together across logs.
            S.listItem()
              .title("Logs")
              .child(S.documentTypeList("logs").title("Logs")),
            S.divider(),
            orderableDocumentListDeskItem({
              type: "keepGoing",
              title: "Keep Going",
              S,
              context,
            }),
            S.listItem()
              .id("batch-upload-keep-going")
              .title("Keep Going (Batch Upload)")
              .icon(UploadIcon)
              .child(
                S.component(BatchUploadKeepGoing)
                  .title("Batch Upload to Keep Going")
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) => !NESTED_TYPES.has(item.getId() ?? "")
            ),
          ]),
    }),
    visionTool(),
  ],
  tools: (prev) => [
    ...prev,
    {
      name: "batch-upload",
      title: "Batch Upload",
      icon: UploadIcon,
      component: BatchUploadKeepGoing,
    },
  ],
  schema: {
    types: [
      post,
      project,
      projectKind,
      page,
      book,
      siteSettings,
      favorite,
      favoriteCategory,
      tool,
      toolCategory,
      logs,
      logsEntry,
      keepGoing,
      // Shared rich-text block types, referenced from every prose field.
      bodyImage,
      inlineImage,
    ],
    /*
     * The "+" inside a label uses one of these, so the reference is already
     * filled in. Declaring `parameters` also keeps them out of the generic
     * "create new document" dialog, where no label is known.
     */
    templates: (prev) => [
      ...prev,
      ...LIST_SECTIONS.map((section) => ({
        id: section.templateId,
        title: section.itemLabel,
        schemaType: section.itemType,
        parameters: [{ name: "categoryId", type: "string" }],
        value: (params?: { categoryId?: string }) =>
          params?.categoryId ? section.templateValue(params.categoryId) : {},
      })),
    ],
  },
});
