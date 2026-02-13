import Image from "next/image";
import { SignOutButton } from "@/app/components/SignOutButton";

type DashboardProfileProps = {
  avatarUrl: string | null;
  name: string | null;
  email: string | null;
};

export function DashboardProfile({
  avatarUrl,
  name,
  email,
}: DashboardProfileProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-3 py-2">
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-slate-200 dark:ring-slate-600">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name ?? "Profile"}
            width={36}
            height={36}
            className="object-cover"
            unoptimized
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium"
            aria-hidden
          >
            {(name ?? email ?? "?")[0].toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {name && (
          <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">
            {name}
          </p>
        )}
        {email && (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {email}
          </p>
        )}
      </div>
      <SignOutButton />
    </div>
  );
}
