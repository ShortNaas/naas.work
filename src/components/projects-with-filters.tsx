"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

type KindItem = { _id: string; title: string };

function getUniqueKinds(projects: Project[]): KindItem[] {
  const seen = new Set<string>();
  const kinds: KindItem[] = [];
  for (const p of projects) {
    if (!p.kind) continue;
    for (const k of p.kind) {
      if (!seen.has(k._id)) {
        seen.add(k._id);
        kinds.push(k);
      }
    }
  }
  return kinds.sort((a, b) => a.title.localeCompare(b.title));
}

function filterProjects(projects: Project[], selectedKindIds: Set<string>): Project[] {
  if (selectedKindIds.size === 0) return projects;
  return projects.filter((p) =>
    p.kind?.some((k) => selectedKindIds.has(k._id))
  );
}

export function ProjectsWithFilters({ projects }: { projects: Project[] }) {
  const [selectedKindIds, setSelectedKindIds] = useState<Set<string>>(new Set());

  const uniqueKinds = useMemo(() => getUniqueKinds(projects), [projects]);
  const filteredProjects = useMemo(
    () => filterProjects(projects, selectedKindIds),
    [projects, selectedKindIds]
  );

  const toggleKind = (id: string) => {
    setSelectedKindIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (projects.length === 0) {
    return (
      <p className="text-sm text-[color:var(--text-muted-color)]">No projects yet.</p>
    );
  }

  return (
    <>
      {uniqueKinds.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {uniqueKinds.map((k) => {
            const isSelected = selectedKindIds.has(k._id);
            return (
              <button
                key={k._id}
                type="button"
                onClick={() => toggleKind(k._id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium uppercase tracking-wide transition-colors
                  ${isSelected
                    ? "bg-[var(--link-color)] text-white"
                    : "bg-[var(--sidebar-bg)] text-[color:var(--text-muted-color)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[color:var(--heading-color)]"
                  }`}
              >
                {k.title}
              </button>
            );
          })}
        </div>
      )}
      {filteredProjects.length === 0 ? (
        <p className="text-sm text-[color:var(--text-muted-color)]">
          No projects match the selected filter.
        </p>
      ) : (
        <ul className="grid gap-6 list-none p-0 m-0 sm:grid-cols-2">
          {filteredProjects.map((project) => (
            <li key={project._id}>
              <article className="h-full rounded-lg bg-[var(--sidebar-bg)] shadow-[var(--card-shadow)] overflow-hidden transition-shadow hover:shadow-lg flex flex-col">
                {project.image && (
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--main-border-color)]">
                    <img
                      src={urlFor(project.image).width(600).height(450).url()}
                      alt=""
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  {project.kind && project.kind.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {project.kind.map((k) => {
                        const isSelected = selectedKindIds.has(k._id);
                        return (
                          <button
                            key={k._id}
                            type="button"
                            onClick={() => toggleKind(k._id)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wide transition-all shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.12)]
                              ${isSelected
                                ? "bg-[var(--link-color)] text-white"
                                : "bg-[var(--sidebar-bg)] text-[color:var(--text-muted-color)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[color:var(--heading-color)]"
                              }`}
                          >
                            {k.title}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <h2 className="mt-1 text-lg font-semibold text-[color:var(--heading-color)]">
                    {project.link ? (
                      <Link
                        href={project.link}
                        className="text-[color:var(--link-color)] hover:underline"
                      >
                        {project.title}
                      </Link>
                    ) : (
                      project.title
                    )}
                  </h2>
                  {project.description && (
                    <p className="mt-2 text-sm text-[color:var(--text-color)] line-clamp-3 flex-1">
                      {project.description}
                    </p>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
