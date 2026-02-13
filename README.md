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
