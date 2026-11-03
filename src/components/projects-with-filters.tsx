"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/sanity/types";
import { PortableText } from "@/components/portable-text";
import { portableTextToPlainString } from "@/lib/portable-text";
import { toHashtag } from "@/lib/category-groups";

type KindItem = { _id: string; title: string };

const TRUNCATE_AT = 200;

/** Cut on a word boundary so the collapsed blurb does not end mid-word. */
function truncate(text: string): string {
  if (text.length <= TRUNCATE_AT) return text;
  const cut = text.slice(0, TRUNCATE_AT);
  const lastSpace = cut.lastIndexOf(" ");
  return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}…`;
}

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
  return projects.filter((p) => p.kind?.some((k) => selectedKindIds.has(k._id)));
}

export function ProjectsWithFilters({ projects }: { projects: Project[] }) {
  const [selectedKindIds, setSelectedKindIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
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
      {/* One summary line rather than announcing the whole list on every toggle. */}
      <p role="status" className="sr-only">
        {filteredProjects.length} project{filteredProjects.length === 1 ? "" : "s"} shown
      </p>
      {uniqueKinds.length > 0 && (
        <div
          role="group"
          aria-label="Filter projects by tag"
          className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-8"
        >
          {uniqueKinds.map((k) => {
            const isSelected = selectedKindIds.has(k._id);
            return (
              <button
                key={k._id}
                type="button"
                onClick={() => toggleKind(k._id)}
                aria-pressed={isSelected}
                className={`cursor-pointer px-1 pointer-coarse:min-h-11 pointer-coarse:px-3 text-sm transition-colors ${
                  isSelected
                    ? "text-[color:var(--link-color)] font-semibold"
                    : "text-[color:var(--text-muted-color)] hover:text-[color:var(--heading-color)]"
                }`}
              >
                {toHashtag(k.title)}
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
        <ul className="list-none p-0 m-0 space-y-7">
          {filteredProjects.map((project) => {
            const isExpanded = expandedIds.has(project._id);
            const plain = project.description
              ? portableTextToPlainString(project.description).trim()
              : "";
            // Only offer "more" when the collapsed blurb would actually cut text.
            const canExpand = plain.length > TRUNCATE_AT;

            return (
              <li key={project._id} className="relative pl-5">
                {/* bullet */}
                <span
                  aria-hidden
                  className="absolute left-0 top-[0.7em] h-1.5 w-1.5 rounded-full bg-[var(--link-color)]"
                />
                {/*
                  Title and tags share one line, comma-separated, wrapping as a
                  unit on narrow screens.
                */}
                <div className="flex flex-wrap items-baseline gap-x-1.5">
                  <div className="text-lg font-semibold text-[color:var(--heading-color)]">
                    {project.link ? (
                      /*
                       * In-page navigation, no new tab. `prefetch` pulls the
                       * destination early so it still feels instant.
                       */
                      <Link
                        href={project.link}
                        prefetch
                        className="text-[color:var(--link-color)] hover:underline"
                      >
                        {project.title}
                      </Link>
                    ) : (
                      project.title
                    )}
                  </div>

                  {project.kind && project.kind.length > 0 && (
                    <div className="flex flex-wrap items-baseline gap-x-1.5 text-sm">
                      <span aria-hidden className="text-[color:var(--text-muted-color)]">
                        ,
                      </span>
                      {project.kind.map((k, i) => (
                        <span key={k._id} className="flex items-baseline gap-x-1.5">
                          {i > 0 && (
                            <span
                              aria-hidden
                              className="text-[color:var(--text-muted-color)]"
                            >
                              ,
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleKind(k._id)}
                            aria-pressed={selectedKindIds.has(k._id)}
                            className={`cursor-pointer px-1 pointer-coarse:min-h-11 pointer-coarse:px-3 transition-colors ${
                              selectedKindIds.has(k._id)
                                ? "text-[color:var(--link-color)] font-semibold"
                                : "text-[color:var(--text-muted-color)] hover:text-[color:var(--heading-color)]"
                            }`}
                          >
                            {toHashtag(k.title)}
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {project.description &&
                  Array.isArray(project.description) &&
                  project.description.length > 0 && (
                    <div className="mt-2 text-sm text-[color:var(--text-color)] [&_a]:text-[color:var(--link-color)] [&_a]:hover:underline [&_p]:mb-1">
                      {isExpanded || !canExpand ? (
                        <PortableText value={project.description} />
                      ) : (
                        <p>{truncate(plain)}</p>
                      )}
                    </div>
                  )}

                {canExpand && (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(project._id)}
                    aria-expanded={isExpanded}
                    className="mt-1 cursor-pointer px-1 pointer-coarse:min-h-11 pointer-coarse:px-3 text-sm text-[color:var(--link-color)] hover:underline"
                  >
                    {isExpanded ? "less" : "more"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
