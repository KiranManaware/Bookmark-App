"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AddBookmarkForm() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const rawUrl = url.trim();
    if (!rawUrl) {
      setError("URL is required");
      return;
    }
    let finalUrl = rawUrl;
    if (!/^https?:\/\//i.test(rawUrl)) {
      finalUrl = `https://${rawUrl}`;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be signed in to add bookmarks.");
      setLoading(false);
      return;
    }
    const { error: err } = await supabase.from("bookmarks").insert({
      user_id: user.id,
      url: finalUrl,
      title: title.trim() || new URL(finalUrl).hostname,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setUrl("");
    setTitle("");
    window.dispatchEvent(new CustomEvent("bookmarks-refresh"));
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500"
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-medium px-4 py-2 hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? "Adding…" : "Add"}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </form>
  );
}
