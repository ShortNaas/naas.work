"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/sanity/types";
import { metaDescription } from "@/lib/portable-text";

const CAPTCHA_ANSWER = "naas";

type Props = {
  projects: Project[];
};

export function ContactForm({ projects }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const answer = captcha.trim().toLowerCase();
    if (answer !== CAPTCHA_ANSWER) {
      setErrorMessage("Captcha answer is incorrect. The site name is shown above.");
      return;
    }
    setErrorMessage("");
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, message, captcha: captcha.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.message ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setFullName("");
      setEmail("");
      setCaptcha("");
      setMessage("");
    } catch {
      setStatus("error");
      setErrorMessage("Failed to send. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-lg border border-[var(--main-border-color)] bg-[var(--card-bg)] shadow-[var(--card-shadow)] p-6 space-y-4"
      >
        <p className="text-[color:var(--heading-color)] font-medium">
          I will get back to you as soon as possible.
        </p>
        <p className="text-[color:var(--text-color)] text-sm">
          In the meantime, explore what I’ve been building:
        </p>
        <ul className="list-none p-0 m-0 space-y-2">
          {projects.map((p) => {
            const blurb = metaDescription(p.description, 90);
            return (
              <li key={p._id}>
                <Link
                  href={p.link ?? "/projects"}
                  className="text-[color:var(--link-color)] hover:underline text-sm"
                >
                  {p.title}
                  {blurb ? ` – ${blurb}` : ""}
                </Link>
              </li>
            );
          })}
        </ul>
        {projects.length === 0 && (
          <Link
            href="/projects"
            className="text-[color:var(--link-color)] hover:underline text-sm"
          >
            View projects
          </Link>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div>
        <label htmlFor="contact-fullname" className="block text-sm font-medium text-[color:var(--heading-color)] mb-1.5">
          Full name
        </label>
        <input
          id="contact-fullname"
          type="text"
          required
          maxLength={100}
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[var(--main-border-color)] bg-[var(--card-bg)] text-[color:var(--text-color)] placeholder:text-[color:var(--text-muted-color)] focus:outline-none focus:ring-2 focus:ring-[var(--link-color)]"
          placeholder="Your name"
        />
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-[color:var(--heading-color)] mb-1.5">
          Email address
        </label>
        <input
          id="contact-email"
          type="email"
          required
          maxLength={200}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[var(--main-border-color)] bg-[var(--card-bg)] text-[color:var(--text-color)] placeholder:text-[color:var(--text-muted-color)] focus:outline-none focus:ring-2 focus:ring-[var(--link-color)]"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="contact-captcha" className="block text-sm font-medium text-[color:var(--heading-color)] mb-1.5">
          To verify you’re human: what is my name? (It’s shown above.)
        </label>
        <input
          id="contact-captcha"
          type="text"
          required
          maxLength={40}
          autoComplete="off"
          value={captcha}
          onChange={(e) => setCaptcha(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[var(--main-border-color)] bg-[var(--card-bg)] text-[color:var(--text-color)] placeholder:text-[color:var(--text-muted-color)] focus:outline-none focus:ring-2 focus:ring-[var(--link-color)]"
          placeholder="Say my name"
        />
        <p className="mt-1 text-xs text-[color:var(--text-muted-color)]">
          My name is Naas.
        </p>
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-[color:var(--heading-color)] mb-1.5">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          maxLength={5000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[var(--main-border-color)] bg-[var(--card-bg)] text-[color:var(--text-color)] placeholder:text-[color:var(--text-muted-color)] focus:outline-none focus:ring-2 focus:ring-[var(--link-color)] resize-y min-h-[120px]"
          placeholder="Your message..."
        />
      </div>
      {errorMessage && (
        <p role="alert" className="text-sm text-[color:var(--danger-color)]">
          {errorMessage}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="px-4 py-2.5 rounded-lg bg-[var(--accent-bg)] text-[var(--accent-fg)] font-medium text-sm hover:opacity-90 disabled:opacity-60 transition-opacity pointer-coarse:min-h-11"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
