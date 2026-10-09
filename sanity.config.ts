import { defineConfig, type ConfigContext } from "sanity";
import { structureTool, type StructureBuilder } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";

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
import { bodyImage } from "./sanity/schemas/bodyImage";
import { inlineImage } from "./sanity/schemas/inlineImage";

export default defineConfig({
  name: "default",
  title: "naas.work",
  projectId: "ouskx1kr",
  dataset: "production",
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S: StructureBuilder, context: ConfigContext) =>
        S.list()
          .title("Content")
          .items([
            // Drag-and-drop ordering for projects; the rank it writes is what
            // the site reads (pinned first, then this order).
            orderableDocumentListDeskItem({
              type: "project",
              title: "Projects (drag to reorder)",
              S,
              context,
            }),
            // Logs list. Open a log and add entries inline through its Entries
            // field, so entries are never mixed together across logs.
            S.listItem()
              .title("Logs")
              .child(S.documentTypeList("logs").title("Logs")),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) =>
                item.getId() !== "project" &&
                item.getId() !== "logs" &&
                // Entries are authored inside their log, not loose in the list.
                item.getId() !== "logsEntry"
            ),
          ]),
    }),
    visionTool(),
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
      // Shared rich-text block types, referenced from every prose field.
      bodyImage,
      inlineImage,
    ],
  },
});
