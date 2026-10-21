import { Item, ItemType, JobStatus, Source, Profile, AppSettings, HubStats } from '../types';

export interface ItemsFilter {
  type?: ItemType | 'all';
  category?: string;
  tag?: string;
  q?: string;
  is_favorite?: boolean;
  is_read?: boolean;
  is_archived?: boolean;
  min_score?: number;
  job_status?: JobStatus | 'all';
  limit?: number;
  offset?: number;
}

export interface ItemsResponse {
  items: Item[];
  total: number;
  has_more: boolean;
}

export interface ApiClient {
  getItems(filter?: ItemsFilter): Promise<ItemsResponse>;
  getItem(id: string): Promise<Item>;
  patchItem(id: string, updates: Partial<Item>): Promise<Item>;
  deleteItem(id: string): Promise<void>;
  reenrichItem(id: string): Promise<Item>;
  patchJobStatus(id: string, status: JobStatus): Promise<Item>;
  
  getTags(): Promise<string[]>;
  getCategories(): Promise<string[]>;
  getStats(): Promise<HubStats>;
  
  getSources(): Promise<Source[]>;
  createSource(source: Omit<Source, 'id'>): Promise<Source>;
  updateSource(id: string, updates: Partial<Source>): Promise<Source>;
  deleteSource(id: string): Promise<void>;
  
  getProfile(): Promise<Profile>;
  updateProfile(profile: Partial<Profile>): Promise<Profile>;
  
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>;
  
  getVapidPublicKey(): Promise<{ publicKey: string }>;
  subscribePush(subscription: Record<string, unknown>): Promise<{ success: boolean }>;
  unsubscribePush(endpoint: string): Promise<{ success: boolean }>;
  testPush(): Promise<{ success: boolean; message: string }>;
  
  runJob(jobType: 'news' | 'jobs'): Promise<{ new_items: number; summary: string }>;
  scrapeIranJobs(): Promise<{ new_items: number; summary: string; items: Item[]; emailReport: Item }>;
  syncTelegramProjects(): Promise<{ synced_count: number; new_projects: any[]; message: string }>;
  simulateTelegramProject(text?: string): Promise<{ project: any; message: string }>;
  getTelegramStatus(): Promise<{ bot_username: string; owner_chat_id: string; connected: boolean }>;
}

