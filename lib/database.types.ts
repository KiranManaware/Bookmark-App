export type Bookmark = {
  id: string;
  user_id: string;
  url: string;
  title: string;
  created_at: string;
};

/** For list display we don't need user_id */
export type BookmarkRow = Pick<Bookmark, "id" | "url" | "title" | "created_at">;
