"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BookmarkRow } from "@/lib/database.types";

const BOOKMARKS_REFRESH_EVENT = "bookmarks-refresh";

export function BookmarkList() {
  const [bookmarks, setBookmarks] = useState<BookmarkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchBookmarks = useCallback(async () => {
    const client = createClient();
    const { data, error } = await client
      .from("bookmarks")
      .select("id, url, title, created_at")
      .order("created_at", { ascending: false });
    if (!error) setBookmarks(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const client = createClient();
      const { data: { user } } = await client.auth.getUser();
      if (!user || cancelled) {
        setLoading(false);
        return;
      }
      const { data, error } = await client
        .from("bookmarks")
        .select("id, url, title, created_at")
        .order("created_at", { ascending: false });
      if (!cancelled && !error) setBookmarks(data ?? []);
      setLoading(false);
    }
    init();

    const channel = supabase
      .channel("bookmarks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        fetchBookmarks
      )
      .subscribe();

    const onRefresh = () => fetchBookmarks();
    window.addEventListener(BOOKMARKS_REFRESH_EVENT, onRefresh);
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      window.removeEventListener(BOOKMARKS_REFRESH_EVENT, onRefresh);
    };
  }, [fetchBookmarks]);

  async function deleteBookmark(id: string) {
    await supabase.from("bookmarks").delete().eq("id", id);
  }

  if (loading) {
    return (
      <div className="text-slate-500 dark:text-slate-400 text-center py-8">
        Loading bookmarks…
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <p className="text-slate-500 dark:text-slate-400 text-center py-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
        No bookmarks yet. Add one above.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {bookmarks.map((b) => (
        <li
          key={b.id}
          className="group flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-sm"
        >
          <a
            href={b.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0"
          >
            <span className="font-medium text-slate-900 dark:text-slate-50 block truncate">
              {b.title || b.url}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 truncate block">
              {b.url}
            </span>
          </a>
          <button
            type="button"
            onClick={() => deleteBookmark(b.id)}
            className="shrink-0 rounded-lg p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition"
            title="Delete bookmark"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}
