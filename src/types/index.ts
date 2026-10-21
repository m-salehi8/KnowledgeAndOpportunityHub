export type ItemType = 'telegram' | 'news' | 'job' | 'email' | 'producthunt';

export type JobStatus = 'new' | 'saved' | 'applied' | 'interview' | 'rejected';

export interface JobMeta {
  company: string;
  location: string;
  remote: boolean;
  salary_text?: string;
  match_score: number; // 0 - 100
  match_reason: string;
  status: JobStatus;
  source_platform?: 'jobinja' | 'jobvision' | 'remoteok' | 'weworkremotely' | 'other';
  requirements?: string[];
  email_sent_to?: string;
}

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  summary: string;
  content: string;
  source_url?: string;
  source_name: string;
  category: string;
  tags: string[];
  is_read: boolean;
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string; // ISO 8601 string
  raw_payload?: Record<string, unknown>;
  dedupe_hash?: string;
  job_meta?: JobMeta;
}

export interface Source {
  id: string;
  name: string;
  url: string;
  kind: 'rss' | 'job_api' | 'telegram_channel' | 'newsletter';
  enabled: boolean;
  last_fetched_at?: string;
}

export interface Profile {
  full_name: string;
  email?: string;
  bio: string;
  skills: string[];
  experience_years?: number;
  preferred_locations: string[];
  remote_preference: 'remote_only' | 'hybrid' | 'any';
  min_salary_usd: number;
  keywords_include: string[];
  keywords_exclude: string[];
  news_interests: string[];
}

export interface AppSettings {
  notifications_enabled: boolean;
  news_digest_time: string; // HH:mm e.g. "07:30"
  job_radar_time: string; // HH:mm e.g. "08:00"
  min_job_score_notify: number; // e.g. 80
  api_url: string;
  app_token: string;
  theme: 'dark' | 'light' | 'system';
  language: 'fa' | 'en';
}

export interface HubStats {
  total_items: number;
  unread_count: number;
  telegram_count: number;
  news_count: number;
  jobs_count: number;
  email_count: number;
  high_match_jobs: number;
  saved_count: number;
  projects_count?: number;
}

export type ProjectStatus = 'active' | 'production' | 'opensource' | 'concept';
export type ProjectCategory = 'ai' | 'fullstack' | 'data' | 'tools' | 'mobile';

export interface Project {
  id: string;
  title: string;
  short_desc: string;
  full_desc: string;
  category: ProjectCategory;
  status: ProjectStatus;
  tech_stack: string[];
  progress_percent: number; // 0 - 100
  impact_score: number; // 0 - 100
  ai_summary: string;
  github_url?: string;
  live_url?: string;
  created_at: string;
  is_favorite?: boolean;
  stars_count?: number;
  source_channel?: 'telegram' | 'manual' | 'github';
  telegram_sender?: string;
}

export interface ProductHuntProduct {
  name: string;
  tagline: string;
  url: string;
  problem_solved: string;
  target_audience: string;
  pricing_model: string;
  tags: string[];
  is_ai: boolean;
}

export interface ProductHuntDailyDigest {
  id: string;
  date_formatted: string;
  created_at: string;
  total_products: number;
  products: ProductHuntProduct[];
  ai_spotlight: string;
  idea_takeaway: string;
}

