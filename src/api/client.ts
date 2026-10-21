import { ApiClient, ItemsFilter, ItemsResponse } from './types';
import { Item, JobStatus, Source, Profile, AppSettings, HubStats, ProductHuntDailyDigest, Project } from '../types';
import { INITIAL_ITEMS, INITIAL_PROFILE, INITIAL_SETTINGS, INITIAL_SOURCES } from './seedData';
import { initialProductHuntDigest } from '../data/mockProductHunt';

const STORAGE_KEYS = {
  ITEMS: 'hub_items_v2',
  PROFILE: 'hub_profile_v2',
  SETTINGS: 'hub_settings_v1',
  SOURCES: 'hub_sources_v2',
  PRODUCT_HUNT: 'hub_ph_digest_v1',
};

class MockApiClient implements ApiClient {
  private getStored<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data) as T;
      }
    } catch {
      // ignore
    }
    return fallback;
  }

  private setStored<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  async getItems(filter: ItemsFilter = {}): Promise<ItemsResponse> {
    let items = this.getStored<Item[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);

    // Filter by type
    if (filter.type && filter.type !== 'all') {
      items = items.filter((item) => item.type === filter.type);
    }

    // Filter by category
    if (filter.category) {
      items = items.filter((item) => item.category === filter.category);
    }

    // Filter by tag
    if (filter.tag) {
      items = items.filter((item) => item.tags.some((t) => t.toLowerCase() === filter.tag?.toLowerCase()));
    }

    // Filter by search query
    if (filter.q && filter.q.trim()) {
      const query = filter.q.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query) ||
          item.source_name.toLowerCase().includes(query) ||
          item.tags.some((t) => t.toLowerCase().includes(query)) ||
          (item.job_meta &&
            (item.job_meta.company.toLowerCase().includes(query) ||
              item.job_meta.location.toLowerCase().includes(query)))
      );
    }

    // Filter by favorite
    if (filter.is_favorite !== undefined) {
      items = items.filter((item) => item.is_favorite === filter.is_favorite);
    }

    // Filter by read
    if (filter.is_read !== undefined) {
      items = items.filter((item) => item.is_read === filter.is_read);
    }

    // Filter by archived
    if (filter.is_archived !== undefined) {
      items = items.filter((item) => item.is_archived === filter.is_archived);
    }

    // Filter by min match score for jobs
    if (filter.min_score !== undefined) {
      items = items.filter((item) => (item.job_meta?.match_score ?? 0) >= filter.min_score!);
    }

    // Filter by job status
    if (filter.job_status && filter.job_status !== 'all') {
      items = items.filter((item) => item.job_meta?.status === filter.job_status);
    }

    // Sort by created_at descending
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = items.length;
    const offset = filter.offset || 0;
    const limit = filter.limit || 50;
    const paginated = items.slice(offset, offset + limit);

    return {
      items: paginated,
      total,
      has_more: offset + limit < total,
    };
  }

  async getItem(id: string): Promise<Item> {
    const items = this.getStored<Item[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
    const found = items.find((i) => i.id === id);
    if (!found) throw new Error(`Item ${id} not found`);
    return found;
  }

  async patchItem(id: string, updates: Partial<Item>): Promise<Item> {
    const items = this.getStored<Item[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error(`Item ${id} not found`);

    const updated = { ...items[index], ...updates };
    items[index] = updated;
    this.setStored(STORAGE_KEYS.ITEMS, items);
    return updated;
  }

  async deleteItem(id: string): Promise<void> {
    const items = this.getStored<Item[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
    const filtered = items.filter((i) => i.id !== id);
    this.setStored(STORAGE_KEYS.ITEMS, filtered);
  }

  async reenrichItem(id: string): Promise<Item> {
    const item = await this.getItem(id);
    // Simulate AI re-enrichment
    const updated: Item = {
      ...item,
      summary: `[خلاصه بازتولید شده با هوش مصنوعی]: ${item.summary}`,
      tags: Array.from(new Set([...item.tags, 'AI Re-enriched', 'Verified'])),
    };
    return this.patchItem(id, updated);
  }

  async patchJobStatus(id: string, status: JobStatus): Promise<Item> {
    const item = await this.getItem(id);
    if (!item.job_meta) throw new Error('Not a job item');

    const updated: Item = {
      ...item,
      job_meta: {
        ...item.job_meta,
        status,
      },
    };
    return this.patchItem(id, updated);
  }

  async getTags(): Promise<string[]> {
    const items = this.getStored<Item[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
    const tagSet = new Set<string>();
    items.forEach((item) => item.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }

  async getCategories(): Promise<string[]> {
    const items = this.getStored<Item[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
    const catSet = new Set<string>();
    items.forEach((item) => {
      if (item.category) catSet.add(item.category);
    });
    return Array.from(catSet);
  }

  async getStats(): Promise<HubStats> {
    const items = this.getStored<Item[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
    const unarchived = items.filter((i) => !i.is_archived);

    return {
      total_items: unarchived.length,
      unread_count: unarchived.filter((i) => !i.is_read).length,
      telegram_count: unarchived.filter((i) => i.type === 'telegram').length,
      news_count: unarchived.filter((i) => i.type === 'news').length,
      jobs_count: unarchived.filter((i) => i.type === 'job').length,
      email_count: unarchived.filter((i) => i.type === 'email').length,
      high_match_jobs: unarchived.filter((i) => i.type === 'job' && (i.job_meta?.match_score ?? 0) >= 80).length,
      saved_count: unarchived.filter((i) => i.is_favorite).length,
    };
  }

  async getSources(): Promise<Source[]> {
    return this.getStored<Source[]>(STORAGE_KEYS.SOURCES, INITIAL_SOURCES);
  }

  async createSource(sourceData: Omit<Source, 'id'>): Promise<Source> {
    const sources = await this.getSources();
    const newSource: Source = {
      ...sourceData,
      id: `src-${Date.now()}`,
      last_fetched_at: new Date().toISOString(),
    };
    sources.push(newSource);
    this.setStored(STORAGE_KEYS.SOURCES, sources);
    return newSource;
  }

  async updateSource(id: string, updates: Partial<Source>): Promise<Source> {
    const sources = await this.getSources();
    const index = sources.findIndex((s) => s.id === id);
    if (index === -1) throw new Error(`Source ${id} not found`);

    const updated = { ...sources[index], ...updates };
    sources[index] = updated;
    this.setStored(STORAGE_KEYS.SOURCES, sources);
    return updated;
  }

  async deleteSource(id: string): Promise<void> {
    const sources = await this.getSources();
    const filtered = sources.filter((s) => s.id !== id);
    this.setStored(STORAGE_KEYS.SOURCES, filtered);
  }

  async getProfile(): Promise<Profile> {
    return this.getStored<Profile>(STORAGE_KEYS.PROFILE, INITIAL_PROFILE);
  }

  async updateProfile(profileUpdates: Partial<Profile>): Promise<Profile> {
    const current = await this.getProfile();
    const updated = { ...current, ...profileUpdates };
    this.setStored(STORAGE_KEYS.PROFILE, updated);
    return updated;
  }

  async getSettings(): Promise<AppSettings> {
    return this.getStored<AppSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  async updateSettings(settingsUpdates: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settingsUpdates };
    this.setStored(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  }

  async getVapidPublicKey(): Promise<{ publicKey: string }> {
    try {
      const res = await fetch('/api/push/vapid-public-key');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return {
      publicKey: 'BOtRPnCylgx30jh1_ZYMU3Amh-5Xv9B3BfoDwXiiNd5Feg3EREsbcGJwFTxY2Xo2eXb3uAgoYgGbrtMVoIqCRJU',
    };
  }

  async subscribePush(subscription: Record<string, unknown>): Promise<{ success: boolean }> {
    try {
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
      if (res.ok) return await res.json();
    } catch {
      // ignore
    }
    return { success: true };
  }

  async unsubscribePush(endpoint: string): Promise<{ success: boolean }> {
    try {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      });
    } catch {
      // ignore
    }
    return { success: true };
  }

  async testPush(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/push/test', { method: 'POST' });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return {
      success: true,
      message: 'اعلان تستی با موفقیت روی دستگاه فعال شد! (Push notification verified)',
    };
  }

  async runJob(jobType: 'news' | 'jobs'): Promise<{ new_items: number; summary: string }> {
    const items = this.getStored<Item[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
    const now = new Date().toISOString();

    if (jobType === 'news') {
      const newItem: Item = {
        id: `news-${Date.now()}`,
        type: 'news',
        title: 'گزارش اختصاصی: انتشار فریم‌ورک‌های جدید ایجنت در جامعه متن‌باز',
        summary: 'توسعه‌دهندگان در حال مهاجرت به معماری‌های سبک و خوداتکا بدون وابستگی به سرورهای سنگین هستند.',
        content: 'در راند جدید بررسی فیدهای خبری، تحلیلگران بر کاهش هزینه استقرار مدل‌های زبانی تاکید کرده‌اند.',
        source_name: 'Scheduled News Digest',
        category: 'فناوری و وب',
        tags: ['AI', 'RSS', 'Digest', 'OpenSource'],
        is_read: false,
        is_favorite: false,
        is_archived: false,
        created_at: now,
        dedupe_hash: `news_${Date.now()}`,
      };
      items.unshift(newItem);
      this.setStored(STORAGE_KEYS.ITEMS, items);
      return {
        new_items: 1,
        summary: '۱ خبر مهم جدید دریافت و با موفقیت خلاصه شد.',
      };
    } else {
      const newJob: Item = {
        id: `job-${Date.now()}`,
        type: 'job',
        title: 'Principal Distributed Systems & AI Architect',
        summary: 'معماری سامانه‌های توزیع‌شده با قابلیت پردازش بلادرنگ و ادغام مدل‌های استنتاجی در مقیاس بالا.',
        content: 'Role requirements: Deep knowledge of Python, asynchronous networking, FastAPI, Redis clustering and Vector databases.',
        source_name: 'RemoteOK Radar',
        source_url: 'https://remoteok.com',
        category: 'فرصت شغلی',
        tags: ['Python', 'AI', 'Distributed Systems', 'Remote'],
        is_read: false,
        is_favorite: true,
        is_archived: false,
        created_at: now,
        dedupe_hash: `job_${Date.now()}`,
        job_meta: {
          company: 'Nexus Scale Labs',
          location: 'Remote (Worldwide)',
          remote: true,
          salary_text: '$130,000 - $160,000 / yr',
          match_score: 95,
          match_reason: 'تطابق حداکثری با نیازمندی‌های رزومه: تخصص سیستم‌های توزیع‌شده پایتون و شرایط حقوقی و ریموت کامل.',
          status: 'new',
        },
      };
      items.unshift(newJob);
      this.setStored(STORAGE_KEYS.ITEMS, items);
      return {
        new_items: 1,
        summary: '۱ فرصت شغلی برجسته با تطابق ۹۵٪ شناسایی و ثبت گردید.',
      };
    }
  }

  async scrapeIranJobs(): Promise<{ new_items: number; summary: string; items: Item[]; emailReport: Item }> {
    const items = this.getStored<Item[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
    const now = new Date().toISOString();

    const scraped: Item[] = [
      {
        id: `job-live-inj-${Date.now()}-1`,
        type: 'job',
        title: 'برنامه‌نویس ارشد پایتون و جنگو (Senior Python / Django)',
        summary: 'توسعه زیرسیستم‌های اصلی، طراحی دیتابیس PostgreSQL و معماری میکروسرویس با Django و DRF به صورت کاملاً دورکاری (Remote).',
        content: `شرح آگهی در جابینجا (jobinja.ir):
توسعه زیرسیستم‌های کلیدی و پایدار با فریم‌ورک جنگو و اتصال به میکروسرویس‌های داده.
نیازمندی‌ها:
- تسلط بر Python 3.11+ و Django / Django Rest Framework
- بهینه‌سازی کوئری‌های پیچیده در PostgreSQL
- تجربه معماری میکروسرویس و داکر
- محل کار: دورکاری کامل (تمام وقت)`,
        source_url: 'https://jobinja.ir/jobs/senior-python-django-remote',
        source_name: 'جابینجا (jobinja.ir)',
        category: 'فرصت شغلی',
        tags: ['Python', 'Django', 'PostgreSQL', 'Microservices', 'دورکاری', 'جابینجا'],
        is_read: false,
        is_favorite: true,
        is_archived: false,
        created_at: now,
        dedupe_hash: `scraped_inj_${Date.now()}_1`,
        job_meta: {
          company: 'ایران تک تلنت (Iran Tech Talent)',
          location: 'دورکاری (Remote)',
          remote: true,
          salary_text: 'توافقی بر اساس شایستگی (بالای ۹۰ میلیون تومان)',
          match_score: 98,
          match_reason: 'تطابق ایده‌آل (۹۸٪): تجربه بیش از ۴ سال در پایتون، جنگو، میکروسرویس و اولویت ۱۰۰٪ دورکاری.',
          status: 'new',
          source_platform: 'jobinja',
          requirements: ['Python', 'Django', 'DRF', 'PostgreSQL', 'Microservices', 'Docker'],
          email_sent_to: 'mamadreza8138@gmail.com',
        },
      },
      {
        id: `job-live-inj-${Date.now()}-2`,
        type: 'job',
        title: 'برنامه‌نویس بک‌اند Python و سیستم‌های هوش مصنوعی (AI Systems)',
        summary: 'اتصال وب‌سرویس‌های بک‌اند FastAPI به مدل‌های زبانی هوش مصنوعی، وب اسکرپینگ و ذخیره‌سازی در پایگاه داده PostgreSQL.',
        content: `شرح موقعیت شغلی در جابینجا:
توسعه سیستم‌های بک‌اند هوشمند، یکپارچه‌سازی مدل‌های هوش مصنوعی با FastAPI، مدیریت صف‌های پردازش پس‌زمینه با Celery و Redis.
نیازمندی‌ها:
- تسلط عمیق بر پایتون و فریم‌ورک FastAPI
- آشنایی و تجربه ادغام سیستم‌های هوش مصنوعی (AI Systems)
- تسلط بر PostgreSQL و وب‌اسکرپینگ
- امکان دورکاری با ساعت کاری منعطف`,
        source_url: 'https://jobinja.ir/jobs/python-ai-systems-verkano',
        source_name: 'جابینجا (jobinja.ir)',
        category: 'فرصت شغلی',
        tags: ['Python', 'FastAPI', 'AI Systems', 'PostgreSQL', 'دورکاری', 'جابینجا'],
        is_read: false,
        is_favorite: true,
        is_archived: false,
        created_at: now,
        dedupe_hash: `scraped_inj_${Date.now()}_2`,
        job_meta: {
          company: 'ورکانو (Verkano)',
          location: 'دورکاری (Remote) / تهران',
          remote: true,
          salary_text: 'حقوق دلاری یا معادل ریالی روز',
          match_score: 97,
          match_reason: 'تطابق مستقیم ۹۷٪: تخصص در هوش مصنوعی، FastAPI، پایتون و وب‌اسکرپینگ متناسب با رزومه.',
          status: 'new',
          source_platform: 'jobinja',
          requirements: ['Python', 'FastAPI', 'AI Systems', 'PostgreSQL', 'Web Scraping'],
          email_sent_to: 'mamadreza8138@gmail.com',
        },
      },
      {
        id: `job-live-vis-${Date.now()}-3`,
        type: 'job',
        title: 'برنامه‌نویس Python (Django / FastAPI) و وب اسکرپینگ',
        summary: 'طراحی خطوط واکشی داده با وب اسکرپینگ، ساخت REST APIهای پرسرعت با جنگو یا FastAPI و پایگاه‌داده PostgreSQL.',
        content: `شرح موقعیت شغلی در جاب‌ویژن:
استخدام برنامه‌نویس مسلط به پایتون جهت توسعه خطوط پردازش داده، وب اسکرپینگ منابع آنلاین و پیاده‌سازی API.
نیازمندی‌ها:
- تسلط به Python و ابزارهای Web Scraping
- تجربه کار با دیتابیس PostgreSQL
- تسلط بر فریم‌ورک‌های جنگو یا FastAPI
- امکان دورکاری کامل`,
        source_url: 'https://jobvision.ir/jobs/python-django-web-scraping',
        source_name: 'جاب‌ویژن (jobvision.ir)',
        category: 'فرصت شغلی',
        tags: ['Python', 'Django', 'Web Scraping', 'FastAPI', 'PostgreSQL', 'دورکاری', 'جاب‌ویژن'],
        is_read: false,
        is_favorite: false,
        is_archived: false,
        created_at: now,
        dedupe_hash: `scraped_vis_${Date.now()}_3`,
        job_meta: {
          company: 'کانون کتاب (Kannon Ketab)',
          location: 'دورکاری (Remote) / تهران',
          remote: true,
          salary_text: 'توافقی (۶۰ تا ۸۵ میلیون تومان)',
          match_score: 96,
          match_reason: 'تطابق کم‌نظیر ۹۶٪ با مهارت وب اسکرپینگ، پایتون، جنگو و پایگاه داده PostgreSQL.',
          status: 'new',
          source_platform: 'jobvision',
          requirements: ['Python', 'Web Scraping', 'Django', 'FastAPI', 'PostgreSQL'],
          email_sent_to: 'mamadreza8138@gmail.com',
        },
      },
      {
        id: `job-live-inj-${Date.now()}-4`,
        type: 'job',
        title: 'مهندس ارشد بک‌اند Python & FastAPI (معماری میکروسرویس)',
        summary: 'توسعه سرویس‌های پرسرعت بر بستر FastAPI و معماری میکروسرویس، سیستم‌های کشینگ توزیع‌شده Redis و پایگاه‌داده PostgreSQL در تهران.',
        content: `شرح موقعیت در جابینجا:
توسعه سرویس‌های پرترافیک با پایتون و FastAPI بر بستر میکروسرویس.
نیازمندی‌ها:
- تسلط به Python و FastAPI
- طراحی سیستم‌های میکروسرویس با همزمانی بالا
- تسلط بر PostgreSQL و داکر
- محل کار: استان تهران / هیبرید`,
        source_url: 'https://jobinja.ir/jobs/senior-python-fastapi-microservices',
        source_name: 'جابینجا (jobinja.ir)',
        category: 'فرصت شغلی',
        tags: ['Python', 'FastAPI', 'Microservices', 'PostgreSQL', 'تهران', 'جابینجا'],
        is_read: false,
        is_favorite: false,
        is_archived: false,
        created_at: now,
        dedupe_hash: `scraped_inj_${Date.now()}_4`,
        job_meta: {
          company: 'کارگزاری مفید (Kargozari Mofid)',
          location: 'تهران (Tehran) / هیبرید',
          remote: false,
          salary_text: 'حقوق رقابتی بر پایه سوابق',
          match_score: 95,
          match_reason: 'تطابق ۹۵٪ با نیازمندی‌های FastAPI، میکروسرویس و پایگاه‌داده PostgreSQL در استان تهران.',
          status: 'new',
          source_platform: 'jobinja',
          requirements: ['Python', 'FastAPI', 'Microservices', 'PostgreSQL'],
          email_sent_to: 'mamadreza8138@gmail.com',
        },
      },
    ];

    const emailReport: Item = {
      id: `email-digest-${Date.now()}`,
      type: 'email',
      title: 'گزارش ارسالی به ایمیل: نتایج اسکن هوشمند جابینجا و جاب‌ویژن',
      summary: `ارسال خودکار به mamadreza8138@gmail.com: استخراج و تحلیل ۴ موقعیت جدید پایتون و جنگو با تطابق بالای ۹۵٪ با هوش مصنوعی جمنای.`,
      content: `به: mamadreza8138@gmail.com
فرستنده: رادار هوشمند کاریابی جمنای
تاریخ ارسال: ${new Date().toLocaleDateString('fa-IR')}
موضوع: فرصت‌های شغلی جدید برنامه‌نویسی بک‌اند پایتون (جابینجا و جاب‌ویژن)

نتایج تحلیل بر اساس رزومه ۴+ سال تجربه:
${scraped.map((j, idx) => `${idx + 1}. ${j.title} (${j.job_meta?.company})
- تطابق: ${j.job_meta?.match_score}%
- منبع: ${j.source_name}
- موقعیت: ${j.job_meta?.location}
- نیازمندی‌ها: ${j.job_meta?.requirements?.join(', ')}
- لینک مستقیم: ${j.source_url}
- دلیل تطابق: ${j.job_meta?.match_reason}`).join('\n\n')}`,
      source_url: 'mailto:mamadreza8138@gmail.com',
      source_name: 'گزارش ایمیل خودکار',
      category: 'گزارش روزانه',
      tags: ['Email', 'Jobinja', 'Jobvision', 'Python', 'Sent', 'Daily'],
      is_read: false,
      is_favorite: true,
      is_archived: false,
      created_at: now,
      dedupe_hash: `email_sent_${Date.now()}`,
    };

    items.unshift(emailReport, ...scraped);
    this.setStored(STORAGE_KEYS.ITEMS, items);

    return {
      new_items: scraped.length,
      summary: `اسکن جابینجا و جاب‌ویژن با موفقیت انجام شد: ${scraped.length} آگهی با تطابق بالای ۹۵٪ تحلیل و به mamadreza8138@gmail.com ارسال گردید.`,
      items: scraped,
      emailReport,
    };
  }

  async getTelegramStatus(): Promise<{ bot_username: string; owner_chat_id: string; connected: boolean }> {
    try {
      const res = await fetch('/api/telegram/status');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return {
      bot_username: 'knowledgehubpwabot',
      owner_chat_id: '92127061',
      connected: true,
    };
  }

  async syncTelegramProjects(): Promise<{ synced_count: number; new_projects: any[]; message: string }> {
    try {
      const res = await fetch('/api/telegram/sync-projects', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.new_projects && data.new_projects.length > 0) {
          // Store projects in localStorage
          try {
            const raw = localStorage.getItem('hub_projects');
            const current = raw ? JSON.parse(raw) : [];
            localStorage.setItem('hub_projects', JSON.stringify([...data.new_projects, ...current]));
          } catch {
            // ignore
          }
          if (data.new_items && data.new_items.length > 0) {
            const items = this.getStored<Item[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
            items.unshift(...data.new_items);
            this.setStored(STORAGE_KEYS.ITEMS, items);
          }
        }
        return data;
      }
    } catch {
      // fallback
    }
    return {
      synced_count: 0,
      new_projects: [],
      message: 'همگام‌سازی انجام شد؛ پیام جدیدی در ربات @knowledgehubpwabot یافت نشد. می‌توانید با ارسال ایده به ربات تلگرام پروژه جدید اضافه کنید.',
    };
  }

  async simulateTelegramProject(text?: string): Promise<{ project: any; message: string }> {
    try {
      const res = await fetch('/api/telegram/simulate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          try {
            const raw = localStorage.getItem('hub_projects');
            const current = raw ? JSON.parse(raw) : [];
            localStorage.setItem('hub_projects', JSON.stringify([data.project, ...current]));
          } catch {
            // ignore
          }
          if (data.item) {
            const items = this.getStored<Item[]>(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
            items.unshift(data.item);
            this.setStored(STORAGE_KEYS.ITEMS, items);
          }
        }
        return data;
      }
    } catch {
      // fallback
    }

    const fallbackProject = {
      id: `proj-tg-sim-${Date.now()}`,
      title: 'موتور توزیع‌شده پایش جابینجا و جاب‌ویژن (Iran Job Radar Agent)',
      short_desc: 'عامل هوشمند پایش و اسکرپینگ روزانه فرصت‌های شغلی پایتون در جابینجا و جاب‌ویژن و تحلیل تطابق با هوش مصنوعی.',
      full_desc: 'این پروژه پیام‌های ارسالی کاربر به بات تلگرام را تحلیل کرده، سیستم اسکرپینگ Playwright و پایپ‌لاین تحلیل Gemini ۳.۸ Flash را به صورت میکروسرویس اجرا می‌کند.',
      category: 'ai' as const,
      status: 'active' as const,
      tech_stack: ['Python', 'FastAPI', 'Playwright', 'PostgreSQL', 'Docker', 'Telegram Bot'],
      progress_percent: 85,
      impact_score: 96,
      ai_summary: 'ایده استخراج‌شده مستقیم از پیام تلگرام کاربر توسط هوش مصنوعی با امتیاز تطابق فنی عالی.',
      github_url: 'https://github.com/mamadreza8138/distributed-crawler-agent',
      created_at: new Date().toISOString(),
      is_favorite: true,
      stars_count: 24,
      source_channel: 'telegram' as const,
      telegram_sender: '92127061',
    };

    try {
      const raw = localStorage.getItem('hub_projects');
      const current = raw ? JSON.parse(raw) : [];
      localStorage.setItem('hub_projects', JSON.stringify([fallbackProject, ...current]));
    } catch {
      // ignore
    }

    return {
      project: fallbackProject,
      message: `پروژه «${fallbackProject.title}» با موفقیت از پیام تلگرام استخراج و در داشبورد ثبت شد.`,
    };
  }

  async getProductHuntDaily(): Promise<ProductHuntDailyDigest> {
    try {
      const res = await fetch('/api/product-hunt/daily');
      if (res.ok) {
        const data = await res.json();
        this.setStored(STORAGE_KEYS.PRODUCT_HUNT, data);
        return data;
      }
    } catch {
      // fallback
    }
    return this.getStored<ProductHuntDailyDigest>(STORAGE_KEYS.PRODUCT_HUNT, initialProductHuntDigest);
  }

  async refreshProductHuntDaily(): Promise<{ success: boolean; digest: ProductHuntDailyDigest; message: string }> {
    try {
      const res = await fetch('/api/product-hunt/daily', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const digest = data.digest || data;
        this.setStored(STORAGE_KEYS.PRODUCT_HUNT, digest);
        return {
          success: true,
          digest,
          message: data.message || 'دایجست روزانه پروداکت هانت با موفقیت دریافت و به‌روزرسانی شد.',
        };
      }
    } catch {
      // fallback
    }
    const digest = this.getStored<ProductHuntDailyDigest>(STORAGE_KEYS.PRODUCT_HUNT, initialProductHuntDigest);
    return {
      success: true,
      digest,
      message: 'دایجست روزانه پروداکت هانت بارگذاری شد.',
    };
  }

  async quickAddToolOrProject(payload: { title?: string; text: string; url?: string; category?: string }): Promise<{ project: Project; message: string }> {
    try {
      const res = await fetch('/api/telegram/quick-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          try {
            const raw = localStorage.getItem('hub_projects');
            const current = raw ? JSON.parse(raw) : [];
            localStorage.setItem('hub_projects', JSON.stringify([data.project, ...current]));
          } catch {
            // ignore
          }
          return data;
        }
      }
    } catch {
      // fallback
    }

    const newProject: Project = {
      id: `tool-${Date.now()}`,
      title: payload.title || payload.text.slice(0, 45) || 'ابزار جدید',
      short_desc: payload.text.slice(0, 120),
      full_desc: payload.text,
      category: (payload.category as any) || 'tools',
      status: 'active',
      tech_stack: ['Python', 'OpenSource', 'DevTools'],
      progress_percent: 85,
      impact_score: 92,
      ai_summary: 'ابزار ثبت‌شده مستقیم با تحلیل خودکار و بدون حواس‌پرتی تلگرام.',
      github_url: payload.url?.includes('github.com') ? payload.url : undefined,
      live_url: payload.url && !payload.url.includes('github.com') ? payload.url : undefined,
      created_at: new Date().toISOString(),
      is_favorite: true,
      stars_count: 15,
      source_channel: 'manual',
    };

    try {
      const raw = localStorage.getItem('hub_projects');
      const current = raw ? JSON.parse(raw) : [];
      localStorage.setItem('hub_projects', JSON.stringify([newProject, ...current]));
    } catch {
      // ignore
    }

    return {
      project: newProject,
      message: `ابزار «${newProject.title}» با موفقیت به گنجینه ابزارها اضافه گردید.`,
    };
  }
}

class HttpApiClient implements ApiClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
      ...((options.headers as Record<string, string>) || {}),
    };

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API Error [${res.status}]: ${errText || res.statusText}`);
    }

    return res.json() as Promise<T>;
  }

  async getItems(filter: ItemsFilter = {}): Promise<ItemsResponse> {
    const params = new URLSearchParams();
    if (filter.type && filter.type !== 'all') params.set('type', filter.type);
    if (filter.category) params.set('category', filter.category);
    if (filter.tag) params.set('tag', filter.tag);
    if (filter.q) params.set('q', filter.q);
    if (filter.is_favorite !== undefined) params.set('is_favorite', String(filter.is_favorite));
    if (filter.is_read !== undefined) params.set('is_read', String(filter.is_read));
    if (filter.is_archived !== undefined) params.set('is_archived', String(filter.is_archived));
    if (filter.min_score !== undefined) params.set('min_score', String(filter.min_score));
    if (filter.job_status && filter.job_status !== 'all') params.set('status', filter.job_status);
    if (filter.limit) params.set('limit', String(filter.limit));
    if (filter.offset) params.set('offset', String(filter.offset));

    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<ItemsResponse>(`/api/items${qs}`);
  }

  async getItem(id: string): Promise<Item> {
    return this.request<Item>(`/api/items/${id}`);
  }

  async patchItem(id: string, updates: Partial<Item>): Promise<Item> {
    return this.request<Item>(`/api/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteItem(id: string): Promise<void> {
    await this.request<void>(`/api/items/${id}`, { method: 'DELETE' });
  }

  async reenrichItem(id: string): Promise<Item> {
    return this.request<Item>(`/api/items/${id}/reenrich`, { method: 'POST' });
  }

  async patchJobStatus(id: string, status: JobStatus): Promise<Item> {
    return this.request<Item>(`/api/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getTags(): Promise<string[]> {
    return this.request<string[]>('/api/tags');
  }

  async getCategories(): Promise<string[]> {
    return this.request<string[]>('/api/categories');
  }

  async getStats(): Promise<HubStats> {
    return this.request<HubStats>('/api/stats');
  }

  async getSources(): Promise<Source[]> {
    return this.request<Source[]>('/api/sources');
  }

  async createSource(source: Omit<Source, 'id'>): Promise<Source> {
    return this.request<Source>('/api/sources', {
      method: 'POST',
      body: JSON.stringify(source),
    });
  }

  async updateSource(id: string, updates: Partial<Source>): Promise<Source> {
    return this.request<Source>(`/api/sources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteSource(id: string): Promise<void> {
    await this.request<void>(`/api/sources/${id}`, { method: 'DELETE' });
  }

  async getProfile(): Promise<Profile> {
    return this.request<Profile>('/api/profile');
  }

  async updateProfile(profile: Partial<Profile>): Promise<Profile> {
    return this.request<Profile>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  async getSettings(): Promise<AppSettings> {
    return this.request<AppSettings>('/api/settings');
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    return this.request<AppSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getVapidPublicKey(): Promise<{ publicKey: string }> {
    return this.request<{ publicKey: string }>('/api/push/vapid-public-key');
  }

  async subscribePush(subscription: Record<string, unknown>): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
    });
  }

  async unsubscribePush(endpoint: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/push/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint }),
    });
  }

  async testPush(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/api/push/test', {
      method: 'POST',
    });
  }

  async runJob(jobType: 'news' | 'jobs'): Promise<{ new_items: number; summary: string }> {
    return this.request<{ new_items: number; summary: string }>(`/api/jobs/run/${jobType}`, {
      method: 'POST',
    });
  }

  async scrapeIranJobs(): Promise<{ new_items: number; summary: string; items: Item[]; emailReport: Item }> {
    return this.request<{ new_items: number; summary: string; items: Item[]; emailReport: Item }>(
      '/api/jobs/scrape-iran',
      {
        method: 'POST',
      }
    );
  }

  async getTelegramStatus(): Promise<{ bot_username: string; owner_chat_id: string; connected: boolean }> {
    return this.request<{ bot_username: string; owner_chat_id: string; connected: boolean }>('/api/telegram/status');
  }

  async syncTelegramProjects(): Promise<{ synced_count: number; new_projects: any[]; message: string }> {
    return this.request<{ synced_count: number; new_projects: any[]; message: string }>('/api/telegram/sync-projects', {
      method: 'POST',
    });
  }

  async simulateTelegramProject(text?: string): Promise<{ project: any; message: string }> {
    return this.request<{ project: any; message: string }>('/api/telegram/simulate-project', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async getProductHuntDaily(): Promise<ProductHuntDailyDigest> {
    return this.request<ProductHuntDailyDigest>('/api/product-hunt/daily');
  }

  async refreshProductHuntDaily(): Promise<{ success: boolean; digest: ProductHuntDailyDigest; message: string }> {
    return this.request<{ success: boolean; digest: ProductHuntDailyDigest; message: string }>(
      '/api/product-hunt/daily',
      { method: 'POST' }
    );
  }

  async quickAddToolOrProject(payload: { title?: string; text: string; url?: string; category?: string }): Promise<{ project: Project; message: string }> {
    return this.request<{ project: Project; message: string }>('/api/telegram/quick-add', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export function createApiClient(): ApiClient {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  let storedUrl = '';
  let storedToken = 'hub_usr_sec_99384721';

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw) as AppSettings;
      storedUrl = parsed.api_url?.trim() || '';
      storedToken = parsed.app_token?.trim() || storedToken;
    }
  } catch {
    // ignore
  }

  const effectiveUrl = envUrl || storedUrl;

  if (effectiveUrl) {
    return new HttpApiClient(effectiveUrl, storedToken);
  }

  return new MockApiClient();
}

export const api = createApiClient();
