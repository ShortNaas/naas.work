"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

export function CommentForm({ postSlug }: { postSlug: string }) {
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  // Honeypot: hidden from people, irresistible to bots.
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postSlug, authorName, email, body, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(data.message ?? "Could not post your comment.");
        return;
      }
      setStatus("success");
      setAuthorName("");
      setEmail("");
      setBody("");
    } catch {
      setStatus("error");
      setMessage("Failed to send. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-lg border border-[var(--main-border-color)] bg-[var(--card-bg)] p-4 text-sm text-[color:var(--text-color)]"
      >
        Thank You.
      </div>
    );
  }

  const field =
    "w-full px-3 py-2 rounded-lg border border-[var(--main-border-color)] bg-[var(--card-bg)] text-[color:var(--text-color)] placeholder:text-[color:var(--text-muted-color)] focus:outline-none focus:ring-2 focus:ring-[var(--link-color)]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="comment-name"
            className="mb-1.5 block text-sm font-medium text-[color:var(--heading-color)]"
          >
            Name
          </label>
          <input
            id="comment-name"
            type="text"
            required
            maxLength={80}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className={field}
            placeholder="Your name"
          />
        </div>
        <div>
          <label
            htmlFor="comment-email"
            className="mb-1.5 block text-sm font-medium text-[color:var(--heading-color)]"
          >
            Email
          </label>
          <input
            id="comment-email"
            type="email"
            required
            maxLength={200}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
            placeholder="you@example.com"
          />
          <p className="mt-1 text-xs text-[color:var(--text-muted-color)]">
            Never published. Only so I can reply.
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="comment-body"
          className="mb-1.5 block text-sm font-medium text-[color:var(--heading-color)]"
        >
          Comment
        </label>
        <textarea
          id="comment-body"
          required
          rows={5}
          maxLength={5000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={`${field} min-h-[120px] resize-y`}
          placeholder="What do you think?"
        />
      </div>

      {/* Honeypot. Hidden from view and from assistive tech. */}
      <div aria-hidden className="hidden">
        <label htmlFor="comment-website">Website</label>
        <input
          id="comment-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {status === "error" && message && (
        <p role="alert" className="text-sm text-red-400">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-lg bg-[var(--accent-bg)] px-4 py-2.5 text-sm font-medium text-[var(--accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "sending" ? "Posting…" : "Post comment"}
      </button>
    </form>
  );
}
