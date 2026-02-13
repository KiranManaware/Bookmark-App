-- Run this ONCE in Supabase Dashboard → SQL Editor (New query)
-- https://supabase.com/dashboard/project/_/sql/new

-- Bookmarks table (private per user)
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  title text not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS)
alter table public.bookmarks enable row level security;

-- Users can only read their own bookmarks
create policy "Users can read own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

-- Users can insert their own bookmarks
create policy "Users can insert own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

-- Users can delete their own bookmarks
create policy "Users can delete own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- Enable Realtime for bookmarks (so other tabs get updates)
alter publication supabase_realtime add table public.bookmarks;
