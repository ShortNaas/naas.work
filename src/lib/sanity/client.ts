import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: "ouskx1kr",
  dataset: "production",
  useCdn: true,
  apiVersion: "2024-01-01",
});
