"use client";

import { useState } from "react";
import type { PendingComment } from "@/lib/comments";
import { formatDateYYYYMMDD } from "@/lib/format-date";

type Action = "approve" | "unapprove" | "delete";

export function CommentsModeration({
  initialComments,
}: {
  initialComments: PendingComment[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const act = async (id: number, action: Action) => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch("/api/comments/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) {
        setError("Action failed. Your session may have expired — sign in again.");
        return;
      }
      const data = await res.json();
      if (Array.isArray(data.comments)) setComments(data.comments);
    } catch {
      setError("Action failed. Check your connection.");
    } finally {
      setBusyId(null);
    }
  };

  if (comments.length === 0) {
    return (
      <p className="text-sm text-[color:var(--text-muted-color)]">
        No comments yet.
      </p>
    );
  }

  const pending = comments.filter((c) => !c.approved);
  const approved = comments.filter((c) => c.approved);

  const card = (c: PendingComment) => (
    <li
      key={c.id}
      className="rounded-lg border border-[var(--main-border-color)] bg-[var(--card-bg)] p-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-semibold text-[color:var(--heading-color)]">
          {c.author_name}
        </span>
        <span className="text-xs text-[color:var(--text-muted-color)]">
          {formatDateYYYYMMDD(c.created_at)} · {c.post_slug}
        </span>
      </div>
      <p className="mt-1 text-xs text-[color:var(--text-muted-color)]">
        {c.email}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-[color:var(--text-color)]">
        {c.body}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {c.approved ? (
          <button
            type="button"
            disabled={busyId === c.id}
            onClick={() => act(c.id, "unapprove")}
            className="cursor-pointer rounded border border-[var(--main-border-color)] px-3 py-1 pointer-coarse:min-h-11 text-xs text-[color:var(--text-color)] hover:bg-[var(--sidebar-hover-bg)] disabled:opacity-50"
          >
            Unapprove
          </button>
        ) : (
          <button
            type="button"
            disabled={busyId === c.id}
            onClick={() => act(c.id, "approve")}
            className="cursor-pointer rounded bg-[var(--accent-bg)] px-3 py-1 pointer-coarse:min-h-11 text-xs text-[var(--accent-fg)] hover:opacity-90 disabled:opacity-50"
          >
            Approve
          </button>
        )}
        <button
          type="button"
          disabled={busyId === c.id}
          onClick={() => act(c.id, "delete")}
          className="cursor-pointer rounded px-3 py-1 pointer-coarse:min-h-11 text-xs text-[color:var(--danger-color)] hover:underline disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </li>
  );

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-[color:var(--danger-color)]">{error}</p>}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[color:var(--text-muted-color)]">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-[color:var(--text-muted-color)]">
            Nothing awaiting moderation.
          </p>
        ) : (
          <ul className="list-none space-y-3 p-0 m-0">{pending.map(card)}</ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[color:var(--text-muted-color)]">
          Published ({approved.length})
        </h2>
        {approved.length === 0 ? (
          <p className="text-sm text-[color:var(--text-muted-color)]">
            No published comments yet.
          </p>
        ) : (
          <ul className="list-none space-y-3 p-0 m-0">{approved.map(card)}</ul>
        )}
      </section>
    </div>
  );
}
