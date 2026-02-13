import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BookmarkList } from "@/app/components/BookmarkList";
import { AddBookmarkForm } from "@/app/components/AddBookmarkForm";
import { DashboardProfile } from "@/app/components/DashboardProfile";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const metadata = user.user_metadata ?? {};
  const avatarUrl =
    (metadata.avatar_url as string) ??
    (metadata.picture as string) ??
    null;
  const name =
    (metadata.full_name as string) ??
    (metadata.name as string) ??
    null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50 shrink-0">
            My Bookmarks
          </h1>
          <DashboardProfile
            avatarUrl={avatarUrl}
            name={name}
            email={user.email ?? null}
          />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <AddBookmarkForm />
        <BookmarkList />
      </main>
    </div>
  );
}
