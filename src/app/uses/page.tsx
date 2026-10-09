import type { Metadata } from "next";
import { client } from "@/lib/sanity/client";
import { toolsQuery } from "@/lib/sanity/queries";
import type { Tool } from "@/lib/sanity/types";
import { CategoryList } from "@/components/category-list";

export const metadata: Metadata = { title: "Tools I use" };

async function getTools(): Promise<Tool[]> {
  const tools = await client.fetch<Tool[]>(toolsQuery);
  return tools ?? [];
}

export default async function ToolsPage() {
  const tools = await getTools();

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-[color:var(--heading-color)] mb-1">
        Tools I use
      </h1>
      <CategoryList items={tools} noun="tools" />
    </div>
  );
}
