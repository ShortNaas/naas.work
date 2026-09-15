import { createClient } from "@sanity/client";
import { dataset, projectId } from "./config";

export const client = createClient({
  projectId,
  dataset,
  useCdn: true,
  apiVersion: "2024-01-01",
});
