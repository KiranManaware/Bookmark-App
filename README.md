# Smart Bookmark App

A simple bookmark manager with Google sign-in, private per-user bookmarks, and real-time sync across tabs.

## Features

- **Google OAuth only** – Sign up and log in with Google (no email/password)
- **Add bookmarks** – URL + optional title
- **Private** – Each user only sees their own bookmarks (Row Level Security)
- **Real-time** – Open two tabs; add or delete in one and see updates in the other (Supabase Realtime)
- **Delete** – Remove your own bookmarks

## Tech Stack

- Next.js 16 (App Router)
- Supabase (Auth, Database, Realtime)
- Tailwind CSS

## Setup

### 1. Environment variables

Copy the example and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

In `.env.local` set:

- `NEXT_PUBLIC_SUPABASE_URL` – from [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – same page, anon/public key

### 2. Supabase: Google OAuth

1. In Supabase Dashboard go to **Authentication** → **Providers** → **Google** and enable it.
2. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (OAuth 2.0 Client ID, Web application).
3. Add the Supabase redirect URL (shown in the Google provider config) to your Google OAuth client’s authorized redirect URIs.
4. Under **Authentication** → **URL Configuration**, set **Site URL** to your app URL (e.g. `http://localhost:3000` for dev, or your Vercel URL for prod). Add **Redirect URLs** for `http://localhost:3000/auth/callback` and `https://your-vercel-app.vercel.app/auth/callback`.

### 3. Database and Realtime

In Supabase Dashboard open **SQL Editor** and run the contents of `supabase/schema.sql`. This creates the `bookmarks` table, RLS policies, and enables Realtime for it.

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with Google, and add bookmarks.

## Deploy on Vercel

1. Push the repo to GitHub (or connect your Git provider in Vercel).
2. In [Vercel](https://vercel.com), **New Project** → import this repo.
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy. Your live URL will be `https://<project>.vercel.app`.
5. In Supabase **Authentication** → **URL Configuration**, set **Site URL** to that Vercel URL and add `https://<project>.vercel.app/auth/callback` to **Redirect URLs**.

After that, the app is available at your Vercel URL with a working live link.

---

## Problems & Solutions

While building and deploying this app, here are the issues encountered and how they were resolved.

### 1. Supabase "URL and Key are required" error on load

**Problem:** Middleware crashed with:

```
Error: Your project's URL and Key are required to create a Supabase client!
```

**Cause:** Next.js only loads `.env.local`, not `.env.local.example`. The project had credentials in the example file but no `.env.local`, so `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` were undefined in middleware.

**Solution:**

- Created `.env.local` by copying from `.env.local.example` and filling in Supabase credentials.
- Added a guard in `lib/supabase/middleware.ts` so the Supabase client is only created when both env vars are set; otherwise the middleware skips auth and returns `NextResponse.next()` to avoid crashing.

---

### 2. "Could not find the table 'public.bookmarks'"

**Problem:** After signing in, adding a bookmark failed with:

```json
{ "code": "...", "message": "Could not find the table \"bookmarks\" in the schema cache" }
```

**Cause:** The `bookmarks` table had not been created in Supabase.

**Solution:** Run the schema in Supabase. Go to **Dashboard → SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and execute it. This creates the table, RLS policies, and enables Realtime.

---

### 3. "new row violates row-level security policy"

**Problem:** Inserting a bookmark returned:

```json
{ "code": "42501", "message": "new row violates row-level security policy for table \"bookmarks\"" }
```

**Cause:** The RLS policy requires `user_id` to equal the signed-in user (`auth.uid()`). The form was only sending `url` and `title`, so `user_id` was missing.

**Solution:** In `AddBookmarkForm.tsx`, fetch the current user with `supabase.auth.getUser()` and include `user_id: user.id` in the insert payload.

---

### 4. Bookmarks not appearing after add

**Problem:** The bookmark was created successfully, but the list still showed "No bookmarks yet. Add one above."

**Cause:** The initial fetch could run before the client had the auth session, and the list did not reliably refresh after a successful insert (Realtime or refetch timing).

**Solution:**

- In `BookmarkList.tsx`, wait for `getUser()` before fetching bookmarks so the first load has a valid session.
- Use a stable `fetchBookmarks` that creates a fresh Supabase client each call for correct auth.
- Dispatch a custom event `bookmarks-refresh` after a successful insert; `BookmarkList` listens and refetches immediately.

---

### 5. Git "dubious ownership" and "not in a git directory"

**Problem:** Git commands failed with:

```
fatal: detected dubious ownership in repository at '...'
fatal: not in a git directory
```

**Cause:** On Windows, the project folder was owned by Administrators while running as a different user. Git 2.35+ refuses to run in such repos until they are marked safe.

**Solution:** Run once:

```bash
git config --global --add safe.directory C:/path/to/smart-bookmark-app
```

Replace with your actual project path. After that, normal Git commands work.

---

### 6. "Can't resolve 'tailwindcss'" / wrong workspace root

**Problem:** Dev server failed with:

```
Error: Can't resolve 'tailwindcss' in 'C:\...\test-task'
```

**Cause:** Next.js/Turbopack inferred the parent folder (`test-task`) as the workspace root instead of `smart-bookmark-app`, so it looked for `node_modules` and `tailwindcss` in the wrong place.

**Solution:** In `next.config.ts`, set the Turbopack root explicitly:

```ts
import path from "path";

const nextConfig = {
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  // ...rest of config
};
```

Ensure you run `npm run dev` from inside the `smart-bookmark-app` directory.
