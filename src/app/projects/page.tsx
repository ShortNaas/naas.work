import { client } from "@/lib/sanity/client";
import { projectsQuery } from "@/lib/sanity/queries";
import type { Project } from "@/lib/sanity/types";
import { ProjectsWithFilters } from "@/components/projects-with-filters";

async function getProjects(): Promise<Project[]> {
  const projects = await client.fetch<Project[]>(projectsQuery);
  return projects ?? [];
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-semibold text-[color:var(--heading-color)] mb-8">
        Projects
      </h1>
      <ProjectsWithFilters projects={projects} />
    </div>
  );
}
