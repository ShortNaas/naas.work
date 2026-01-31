import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { post } from "./sanity/schemas/post";
import { project } from "./sanity/schemas/project";
import { projectKind } from "./sanity/schemas/projectKind";
import { page } from "./sanity/schemas/page";
import { book } from "./sanity/schemas/book";
import { milestone } from "./sanity/schemas/milestone";
import { siteSettings } from "./sanity/schemas/siteSettings";

export default defineConfig({
  name: "default",
  title: "naas.work",
  projectId: "ouskx1kr",
  dataset: "production",
  basePath: "/studio",
  api: {
    projectId: "ouskx1kr",
    dataset: "production",
  },
  plugins: [structureTool(), visionTool()],
  schema: {
    types: [post, project, projectKind, page, book, milestone, siteSettings],
  },
});