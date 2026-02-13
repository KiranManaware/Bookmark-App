import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignInButton } from "@/app/components/SignInButton";
import { AuthError } from "@/app/components/AuthError";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await searchParams;

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4">
      <main className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 text-center mb-2">
          Smart Bookmark
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
          Save and sync your bookmarks across devices. Sign in to get started.
        </p>
        {error === "auth" && <AuthError />}
        <SignInButton />
      </main>
    </div>
  );
}
