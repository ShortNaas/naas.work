"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Signs in by exchanging the admin secret for an httpOnly session cookie. */
export function CommentsSignIn() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/comments/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Sign in failed.");
        return;
      }
      // The cookie is set; re-render the server page into the dashboard.
      router.refresh();
    } catch {
      setError("Sign in failed. Check your connection.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-sm space-y-4">
      <div>
        <label
          htmlFor="admin-secret"
          className="mb-1.5 block text-sm font-medium text-[color:var(--heading-color)]"
        >
          Admin secret
        </label>
        <input
          id="admin-secret"
          type="password"
          required
          autoComplete="current-password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="w-full rounded-lg border border-[var(--main-border-color)] bg-[var(--card-bg)] px-3 py-2 text-[color:var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--link-color)]"
          placeholder="COMMENTS_ADMIN_SECRET"
        />
        <p className="mt-1 text-xs text-[color:var(--text-muted-color)]">
          The value of the COMMENTS_ADMIN_SECRET environment variable.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-[color:var(--danger-color)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="cursor-pointer rounded-lg bg-[var(--accent-bg)] px-4 py-2.5 pointer-coarse:min-h-11 text-sm font-medium text-[var(--accent-fg)] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
