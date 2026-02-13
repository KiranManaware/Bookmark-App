import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BookmarkList } from "@/app/components/BookmarkList";
import { AddBookmarkForm } from "@/app/components/AddBookmarkForm";
import { SignOutButton } from "@/app/components/SignOutButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
            My Bookmarks
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <AddBookmarkForm />
        <BookmarkList />
      </main>
    </div>
  );
}
