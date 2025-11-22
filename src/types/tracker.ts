export interface TrackerArticle {
  id: number;
  title: string;
  summary?: string | null;
  body?: string | null;
  status: string;
  editor?: string | null;
  source?: string | null;
  content_source?: string | null;
  images?: string[] | null;
  created_at?: string | null;
  latest_comment?: string | null;
}
