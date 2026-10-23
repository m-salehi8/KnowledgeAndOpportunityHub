// @ts-nocheck
import { Item, Source, Profile, AppSettings } from '../types';

export const INITIAL_PROFILE: Profile = {
  full_name: 'محمدرضا صالحی',
  email: 'user@example.com',
  bio: '۵ سال تجربه در ساخت سرویس با Python، Django و FastAPI، طراحی پایپ‌لاین‌های داده، موتورهای ناهمگام DAG و خودکارسازی فرآیندهای سازمانی با ایجنت‌های هوش مصنوعی.',
  skills: [
    'Python',
    'Django',
    'Django Rest Framework (DRF)',
    'FastAPI',
    'Flask',
    'Celery',
    'Async Programming',
    'PostgreSQL (Query Optimization & Data Integrity)',
    'Redis',
    'Elasticsearch',
    'RabbitMQ',
    'MongoDB',
    'MySQL',
    'AI Agents & LLM Orchestration',
    'RAG & Prompt Engineering',
    'Dify',
    'Web Scraping (Scrapy, Anti-Bot, Proxy Rotation)',
    'Pandas & ETL Pipelines',
    'Docker',
    'Linux & Nginx',
    'CI/CD & Automated Testing',
    'Microservices Architecture',
    'Clean Architecture & SOLID',
    'Workflow Builders & DAG Engines',
  ],
  experience_years: 5,
  preferred_locations: ['دورکاری (Remote)', 'International Remote', 'تهران (Tehran)'],
  remote_preference: 'remote_only',
  min_salary_usd: 80000,
  keywords_include: [
    'Python',
    'Django',
    'FastAPI',
    'Backend',
    'Data Engineer',
    'Scraping',
    'AI Agents',
    'LLM',
    'Elasticsearch',
    'RabbitMQ',
    'Microservices',
    'ETL',
  ],
  keywords_exclude: ['Junior', 'Wordpress', 'کارآموز', 'PHP 5'],
  news_interests: [
    'دایجست روزانه Product Hunt',
    'هوش مصنوعی، ایجنت‌ها و مدل‌های زبانی (LLMs)',
    'معماری‌های نرم‌افزاری مدرن و میکروسرویس‌ها',
    'استخدام و رادار شغلی پایتون (جابینجا و جاب‌ویژن)',
  ],
};

export const INITIAL_SETTINGS: AppSettings = {
  notifications_enabled: true,
  news_digest_time: '07:30',
  job_radar_time: '08:00',
  min_job_score_notify: 80,
  api_url: '',
  app_token: 'mock-preview-token',
  theme: 'dark',
  language: 'fa',
};

export const INITIAL_SOURCES: Source[] = [
  {
    id: 'src-jobinja',
    name: 'جابینجا - جاب رادار پایتون و جنگو',
    url: 'https://jobinja.ir/jobs?filters%5Bkeywords%5D%5B%5D=Python',
    kind: 'job_api',
    enabled: true,
    last_fetched_at: '2026-10-21T08:00:00Z',
  },
  {
    id: 'src-jobvision',
    name: 'جاب‌ویژن - فرصت‌های پایتون و بک‌اند',
    url: 'https://jobvision.ir/jobs/category/developer-programmer?keyword=Python',
    kind: 'job_api',
    enabled: true,
    last_fetched_at: '2026-10-21T08:02:00Z',
  },
  {
    id: 'src-1',
    name: 'Hacker News Frontpage',
    url: 'https://news.ycombinator.com/rss',
    kind: 'rss',
    enabled: true,
    last_fetched_at: '2026-10-21T07:30:00Z',
  },
  {
    id: 'src-2',
    name: 'GitHub Trending (Python & TS)',
    url: 'https://github-trends.vercel.app/rss',
    kind: 'rss',
    enabled: true,
    last_fetched_at: '2026-10-21T07:31:00Z',
  },
  {
    id: 'src-3',
    name: 'ArXiv CS.AI Daily Papers',
    url: 'https://rss.arxiv.org/rss/cs.AI',
    kind: 'rss',
    enabled: true,
    last_fetched_at: '2026-10-21T07:32:00Z',
  },
  {
    id: 'src-4',
    name: 'RemoteOK API (Software Engineering)',
    url: 'https://remoteok.com/api?tag=engineer',
    kind: 'job_api',
    enabled: true,
    last_fetched_at: '2026-10-21T08:00:00Z',
  },
];

export const INITIAL_ITEMS: Item[] = [
  // 0. Latest Daily Report Email to user@example.com
  {
    id: 'email-report-today',
    type: 'email',
    title: 'گزارش روزانه هوش مصنوعی: رادار آگهی‌های پایتون (جابینجا و جاب‌ویژن)',
    summary: 'ارسال خودکار به user@example.com: شناسایی ۴ موقعیت با تطابق بالای ۹۵٪ در جابینجا و جاب‌ویژن متناسب با رزومه ۴+ سال پایتون، جنگو و میکروسرویس.',
    content: `به: user@example.com
فرستنده: هوش مصنوعی جمنای (Knowledge & Job Radar)
ساعت ارسال: ۰۸:۰۰ صبح امروز
موضوع: گزارش روزانه موقعیت‌های جدید برنامه‌نویس بک‌اند پایتون (جابینجا و جاب‌ویژن)

محمدرضا گرامی،
بر اساس مهارت‌های شما (پایتون، جنگو، FastAPI، معماری میکروسرویس، PostgreSQL، وب‌اسکرپینگ و سیستم‌های هوش مصنوعی با ۴+ سال سابقه)، فرصت‌های شغلی جدید اسکن و تحلیل شدند:

۱. برنامه‌نویس ارشد پایتون و جنگو (ایران تک تلنت)
- تطابق هوش مصنوعی: ۹۸٪
- شرکت: Iran Tech Talent
- منبع: جابینجا (jobinja.ir)
- نوع همکاری: دورکاری کامل (Remote)
- نیازمندی‌ها: Python, Django, DRF, PostgreSQL, Docker, Microservices
- لینک آگهی: https://jobinja.ir/jobs?filters%5Bkeywords%5D%5B%5D=Python

۲. برنامه‌نویس بک‌اند Python و سیستم‌های هوش مصنوعی (ورکانو)
- تطابق هوش مصنوعی: ۹۷٪
- شرکت: Verkano
- منبع: جابینجا (jobinja.ir)
- نوع همکاری: دورکاری / تهران
- نیازمندی‌ها: Python, FastAPI, AI Systems, PostgreSQL, Celery
- لینک آگهی: https://jobinja.ir/jobs?filters%5Bkeywords%5D%5B%5D=Python%20AI

۳. توسعه‌دهنده Python (Django) و وب اسکرپینگ (کانون کتاب)
- تطابق هوش مصنوعی: ۹۶٪
- شرکت: کانون کتاب
- منبع: جاب‌ویژن (jobvision.ir)
- نوع همکاری: دورکاری
- نیازمندی‌ها: Python, Django, Web Scraping, PostgreSQL
- لینک آگهی: https://jobvision.ir/jobs?query=python

۴. مهندس ارشد بک‌اند Python & FastAPI (کارگزاری مفید)
- تطابق هوش مصنوعی: ۹۵٪
- شرکت: کارگزاری مفید
- منبع: جابینجا (jobinja.ir)
- نوع همکاری: استان تهران / هیبرید
- نیازمندی‌ها: FastAPI, Microservices, Asyncio, PostgreSQL
- لینک آگهی: https://jobinja.ir/jobs?filters%5Bkeywords%5D%5B%5D=FastAPI`,
    source_url: 'mailto:user@example.com',
    source_name: 'گزارش روزانه ایمیل',
    category: 'گزارش روزانه',
    tags: ['Email', 'Jobinja', 'Jobvision', 'Python', 'Report', 'Daily'],
    is_read: false,
    is_favorite: true,
    is_archived: false,
    created_at: new Date().toISOString(),
    dedupe_hash: 'email_daily_digest_today',
  },

  // 1. Jobinja Job 1 - 98% Match
  {
    id: 'job-ir-1',
    type: 'job',
    title: 'برنامه‌نویس ارشد پایتون و جنگو (Senior Python / Django)',
    summary: 'توسعه زیرسیستم‌های اصلی، طراحی دیتابیس PostgreSQL و معماری میکروسرویس با Django و DRF به صورت کاملاً دورکاری (Remote).',
    content: `شرح موقعیت شغلی در جابینجا:
توسعه زیرسیستم‌های اصلی، طراحی دیتابیس PostgreSQL، نوشتن کدهای تمیز و ماژولار و توسعه REST API با Django Rest Framework و پیاده‌سازی تست‌های خودکار.

نیازمندی‌های اصلی:
- تسلط کامل به Python و فریم‌ورک Django / DRF (حداقل ۳ سال سابقه)
- تجربه کار با دیتابیس PostgreSQL و بهینه‌سازی کوئری‌ها
- آشنایی با داکر (Docker)، Redis، صف‌های Celery و میکروسرویس‌ها
- نوع همکاری: تمام وقت، کاملاً دورکاری (محل سکونت اهمیتی ندارد)`,
    source_url: 'https://jobinja.ir/jobs?filters%5Bkeywords%5D%5B%5D=Python',
    source_name: 'جابینجا (jobinja.ir)',
    category: 'فرصت شغلی',
    tags: ['Python', 'Django', 'PostgreSQL', 'Microservices', 'Docker', 'دورکاری', 'جابینجا'],
    is_read: false,
    is_favorite: true,
    is_archived: false,
    created_at: '2026-10-21T08:10:00Z',
    dedupe_hash: 'job_inj_ir_1',
    job_meta: {
      company: 'ایران تک تلنت (Iran Tech Talent)',
      location: 'دورکاری (Remote)',
      remote: true,
      salary_text: 'توافقی بر اساس شایستگی (بالای ۹۰ میلیون تومان)',
      match_score: 98,
      match_reason: 'تطابق ایده‌آل (۹۸٪) با مهارت‌های پایتون، جنگو، PostgreSQL، میکروسرویس و سابقه کاری بیش از ۴ سال، با اولویت دورکاری کامل.',
      status: 'saved',
      source_platform: 'jobinja',
      requirements: ['Python', 'Django', 'DRF', 'PostgreSQL', 'Docker', 'Microservices'],
      email_sent_to: 'user@example.com',
    },
  },

  // 2. Jobinja Job 2 - 97% Match
  {
    id: 'job-ir-2',
    type: 'job',
    title: 'برنامه‌نویس بک‌اند Python و سیستم‌های هوش مصنوعی (AI Systems)',
    summary: 'اتصال وب‌سرویس‌های بک‌اند FastAPI و پایتون به مدل‌های هوش مصنوعی مولد، وب اسکرپینگ داده‌ها و ذخیره‌سازی در PostgreSQL.',
    content: `شرح موقعیت شغلی در جابینجا:
توسعه سیستم‌های بک‌اند هوشمند، یکپارچه‌سازی مدل‌های هوش مصنوعی با FastAPI، مدیریت صف‌های پردازش پس‌زمینه با Celery و Redis.
نیازمندی‌های اصلی:
- تسلط بر پایتون و FastAPI یا Django
- سابقه کار با مدل‌های هوش مصنوعی و یکپارچه‌سازی سامانه‌های AI
- تسلط بر PostgreSQL، پایگاه‌های داده رابطه‌ای و داکر
- مهارت در استخراج داده و وب اسکرپینگ
- امکان دورکاری کامل از تمام نقاط کشور`,
    source_url: 'https://jobinja.ir/jobs?filters%5Bkeywords%5D%5B%5D=Python%20AI',
    source_name: 'جابینجا (jobinja.ir)',
    category: 'فرصت شغلی',
    tags: ['Python', 'FastAPI', 'AI Systems', 'PostgreSQL', 'Microservices', 'دورکاری', 'جابینجا'],
    is_read: false,
    is_favorite: true,
    is_archived: false,
    created_at: '2026-10-21T08:05:00Z',
    dedupe_hash: 'job_inj_ir_2',
    job_meta: {
      company: 'ورکانو (Verkano)',
      location: 'دورکاری (Remote) / تهران',
      remote: true,
      salary_text: 'توافقی بر پایه دلار یا تومان روز',
      match_score: 97,
      match_reason: 'تطابق مستقیم ۹۷٪ با مهارت‌های تخصصی هوش مصنوعی، FastAPI، پایتون، وب اسکرپینگ و سیستم‌های توزیع‌شده.',
      status: 'interview',
      source_platform: 'jobinja',
      requirements: ['Python', 'FastAPI', 'AI Systems', 'PostgreSQL', 'Docker', 'Celery'],
      email_sent_to: 'user@example.com',
    },
  },

  // 3. Jobvision Job 1 - 96% Match
  {
    id: 'job-ir-3',
    type: 'job',
    title: 'برنامه‌نویس Python (Django / FastAPI) و وب اسکرپینگ',
    summary: 'طراحی خطوط واکشی داده با وب اسکرپینگ پیشرفته، ساخت APIهای پرسرعت با جنگو یا FastAPI و پایگاه‌داده PostgreSQL.',
    content: `شرح موقعیت در جاب‌ویژن (jobvision.ir):
به دنبال برنامه‌نویس مسلط به پایتون جهت توسعه خطوط پردازش داده، وب اسکرپینگ منابع آنلاین، و توسعه بک‌اند با Django یا FastAPI.
نیازمندی‌های کلیدی:
- تسلط بر Python و وب‌اسکرپینگ (Scrapy, Playwright, BeautifulSoup)
- تجربه کار با دیتابیس PostgreSQL و مایگریشن‌ها
- تسلط بر Django و REST API
- امکان دورکاری با جلسات آنلاین هماهنگی هفتگی`,
    source_url: 'https://jobvision.ir/jobs?query=python',
    source_name: 'جاب‌ویژن (jobvision.ir)',
    category: 'فرصت شغلی',
    tags: ['Python', 'Django', 'Web Scraping', 'FastAPI', 'PostgreSQL', 'دورکاری', 'جاب‌ویژن'],
    is_read: false,
    is_favorite: false,
    is_archived: false,
    created_at: '2026-10-21T07:55:00Z',
    dedupe_hash: 'job_vis_ir_3',
    job_meta: {
      company: 'کانون کتاب (Kannon Ketab)',
      location: 'دورکاری (Remote) / تهران',
      remote: true,
      salary_text: 'توافقی (۶۰ تا ۸۵ میلیون تومان)',
      match_score: 96,
      match_reason: 'تطابق کم‌نظیر ۹۶٪ با مهارت تخصصی وب اسکرپینگ، پایتون، جنگو، PostgreSQL و اولویت دورکاری.',
      status: 'new',
      source_platform: 'jobvision',
      requirements: ['Python', 'Web Scraping', 'Django', 'FastAPI', 'PostgreSQL'],
      email_sent_to: 'user@example.com',
    },
  },

  // 4. Jobinja Job 4 - 95% Match
  {
    id: 'job-ir-4',
    type: 'job',
    title: 'مهندس ارشد بک‌اند Python & FastAPI (معماری میکروسرویس)',
    summary: 'توسعه سرویس‌های مالی بر بستر FastAPI و معماری میکروسرویس، سیستم‌های کشینگ توزیع‌شده Redis و پایگاه‌داده PostgreSQL در تهران.',
    content: `شرح موقعیت شغلی در جابینجا:
تیم پلتفرم نرم‌افزاری در حال جذب مهندس ارشد بک‌اند پایتون است.
نیازمندی‌ها:
- تسلط عمیق به Python و فریم‌ورک FastAPI
- طراحی سیستم‌های میکروسرویس با همزمانی بالا (Asyncio)
- تسلط به PostgreSQL و Redis
- تجربه کار با داکر و پایپ‌لاین‌های CI/CD
- محل کار: استان تهران (امکان دورکاری دوره‌ای و ساعت کاری منعطف)`,
    source_url: 'https://jobinja.ir/jobs?filters%5Bkeywords%5D%5B%5D=FastAPI',
    source_name: 'جابینجا (jobinja.ir)',
    category: 'فرصت شغلی',
    tags: ['Python', 'FastAPI', 'Microservices', 'PostgreSQL', 'تهران', 'جابینجا'],
    is_read: false,
    is_favorite: false,
    is_archived: false,
    created_at: '2026-10-21T07:40:00Z',
    dedupe_hash: 'job_inj_ir_4',
    job_meta: {
      company: 'کارگزاری مفید (Kargozari Mofid)',
      location: 'تهران (Tehran) / هیبرید',
      remote: false,
      salary_text: 'حقوق توافقی بر پایه شایستگی + بیمه تکمیلی',
      match_score: 95,
      match_reason: 'تطابق ۹۵٪ با نیازمندی‌های FastAPI، میکروسرویس، پایتون و پایگاه داده PostgreSQL در استان تهران.',
      status: 'new',
      source_platform: 'jobinja',
      requirements: ['Python', 'FastAPI', 'Microservices', 'PostgreSQL', 'Asyncio'],
      email_sent_to: 'user@example.com',
    },
  },
  {
    id: 'item-101',
    type: 'job',
    title: 'Staff Full-Stack & AI Systems Engineer',
    summary: 'نقش مهندس ارشد فول‌استک و سیستم‌های AI با تمرکز بر توسعه میکروسرویس‌های پایتون، عامل‌های هوشمند و رابط کاربری وب ری‌اکت در یک تیم کاملاً ریموت بین‌المللی.',
    content: `About the Role:
We are seeking a Staff Full-Stack & AI Systems Engineer to join our distributed core product team. You will architect and implement mission-critical backend services using Python 3.11+ (FastAPI), integrate LLM inference workflows, and build ultra-responsive frontend dashboards with React and TypeScript.

Key Responsibilities:
- Design and scale distributed event-driven pipelines handling millions of daily events.
- Integrate cutting-edge AI models (Gemini, Claude) using custom agentic architectures and strict JSON schemas.
- Collaborate with designers to build sleek, accessible, PWA-ready web clients.
- Mentor junior engineers and drive architectural RFCs.

Qualifications:
- 5+ years building production backend services in Python (FastAPI/SQLAlchemy).
- Deep experience with modern frontend stacks (React 19, TypeScript, Tailwind).
- Proven track record with vector databases, embeddings, and generative AI APIs.
- Autonomous, async-first communicator comfortable across multiple time zones.`,
    source_url: 'https://remoteok.com/remote-full-stack-jobs',
    source_name: 'RemoteOK Job Radar',
    category: 'فرصت شغلی',
    tags: ['Python', 'FastAPI', 'React', 'AI', 'Remote', 'Senior'],
    is_read: false,
    is_favorite: true,
    is_archived: false,
    created_at: '2026-10-21T08:00:00Z',
    dedupe_hash: 'job_syn_101',
    job_meta: {
      company: 'Synthetic Labs',
      location: 'Fully Remote (Global / EMEA)',
      remote: true,
      salary_text: '$120,000 - $145,000 / yr + Equity',
      match_score: 96,
      match_reason: 'تطابق کامل مهارت‌ها (FastAPI, React, TypeScript, AI APIs) با ترجیح ریموت ۱۰۰٪ و بازه حقوقی بالاتر از حداقل مدنظر.',
      status: 'saved',
    },
  },

  // 2. Telegram bookmark
  {
    id: 'item-102',
    type: 'telegram',
    title: 'معماری حافظه بلندمدت برای ایجنت‌های هوش مصنوعی (Self-Reflective Context)',
    summary: 'خلاصه مقاله جدید در مورد روش‌های بهینه‌سازی حافظه ایجنت‌های نرم‌افزاری با ساختار درختی و خلاصه‌سازی خودکار در گره‌های محاوره‌ای.',
    content: `پیام فوروارد شده از کانال @DeepLearningNotes:
روش جدیدی به نام Hierarchical Episodic Context منتشر شده که برای سیستم‌های تعاملی بلندمدت به جای کش کردن تمام تاریخچه پیام‌ها، در بازه‌های ۱۰ مکالمه‌ای یک ساختار درختی ایجاد کرده و بر اساس قصد کاربر بخش‌های مرتبط را واکشی می‌کند.

مزایا:
۱. کاهش ۶۵ درصدی هزینه توکن‌های ورودی در Gemini 2.5 Flash
۲. حفظ سازگاری حافظه بیش از ۳۰ روز
۳. پیاده‌سازی سریع با پایگاه داده برداری sqlite-vec

لینک مقاله گیت‌هاب و دمو: https://github.com/agent-memory/hierarchical-context-tree`,
    source_url: 'https://github.com/agent-memory/hierarchical-context-tree',
    source_name: 'Telegram: @DeepLearningNotes',
    category: 'معماری و AI',
    tags: ['AI Agents', 'LLM', 'Python', 'Architecture', 'Memory'],
    is_read: false,
    is_favorite: true,
    is_archived: false,
    created_at: '2026-10-21T07:45:00Z',
    dedupe_hash: 'tg_msg_88491',
  },

  // 3. News digest
  {
    id: 'item-103',
    type: 'news',
    title: 'انتشار نسخه نهایی Vite 8 و پشتیبانی رسمی از کامپایلر بومی Tailwind v4',
    summary: 'تیم Vite و Tailwind با همکاری یکدیگر سرعت بیلد اولیه را تا ۳ برابر کاهش دادند و پشتیبانی کامل از وب ورکرز و ماژول‌های ES2026 را فراهم کردند.',
    content: `Vite 8 has officially entered GA with lightning-fast cold start times powered by the unified rust-based bundler engine and zero-config Tailwind v4 integration.

Key highlights:
- Sub-millisecond HMR propagation across large mono-repos.
- First-class support for React 19 Server Components and Progressive Web App asset bundling.
- Native TypeScript type-stripping support reducing development memory footprint by 40%.
Developers migrating from Vite 5 or 6 can expect drop-in configuration compatibility with significant performance gains.`,
    source_url: 'https://vite.dev/blog/announcing-vite-8',
    source_name: 'Hacker News Digest',
    category: 'توسعه وب',
    tags: ['Vite', 'React', 'Frontend', 'Performance', 'Tools'],
    is_read: true,
    is_favorite: false,
    is_archived: false,
    created_at: '2026-10-21T06:30:00Z',
    dedupe_hash: 'news_hn_99120',
  },

  // 4. Job radar
  {
    id: 'item-104',
    type: 'job',
    title: 'Senior Python & Data Pipeline Architect',
    summary: 'معماری و مقیاس‌پذیری پایپ‌لاین‌های داده با پایتون، Kafka و دیتابیس‌های PostgreSQL در استارتاپ بین‌المللی حوزه سلامت.',
    content: `We are looking for a Senior Backend Architect to take ownership of our real-time patient analytics telemetry pipelines. 
Key requirements:
- Extensive Python backend mastery with async frameworks (FastAPI/Tornado).
- Solid grasp of ACID guarantees, query tuning in PostgreSQL, and Redis caching layers.
- Hands-on Docker, Kubernetes, and CI/CD automation.`,
    source_url: 'https://weworkremotely.com/categories/remote-programming-jobs',
    source_name: 'WeWorkRemotely',
    category: 'فرصت شغلی',
    tags: ['Python', 'PostgreSQL', 'FastAPI', 'Data Pipelines', 'Remote'],
    is_read: false,
    is_favorite: false,
    is_archived: false,
    created_at: '2026-10-21T05:15:00Z',
    dedupe_hash: 'job_wwr_4419',
    job_meta: {
      company: 'BioPulse Analytics',
      location: 'Remote (Worldwide)',
      remote: true,
      salary_text: '$95,000 - $115,000 / yr',
      match_score: 91,
      match_reason: 'تطابق چشمگیر تخصص پایتون، دیتابیس و معماری توزیع‌شده با شرایط کار دورکاری و شرایط مالی مطلوب.',
      status: 'new',
    },
  },

  // 5. Inbound Email
  {
    id: 'item-105',
    type: 'email',
    title: 'گزارش هفتگی اتوماسیون Gemini: تحلیل ۵ رپازیتوری پرطرفدار گیت‌هاب',
    summary: 'خلاصه ایمیل ارسالی از تسک زمان‌بندی‌شده کلود در مورد ابزارهای جدید تولید کد و فریم‌ورک‌های سبک ایجنت پایتون.',
    content: `از: scheduled-tasks@cloud-agent.internal
موضوع: Weekly Synthesis: Emerging Dev Tools & AI Frameworks

خلاصه ۵ پروژه برتر هفته:
۱. fastapi-agentic-core: اکستنشن سبک FastAPI برای هندل کردن وب‌هوک‌های دوطرفه با قابلیت Retry خودکار و صف تسک بر پایه SQLite.
۲. react-mobile-spring: کتابخانه انیمیشن بهینه‌شده برای لمس در گوشی‌های همراه بدون لگ رفرش.
۳. trafilatura-fast: بهینه‌سازی استخراج محتوای متنی از صفحات وب با حذف هوشمند تبلیغات و هدرها.
۴. pwa-ios-push-kit: ابزارهای دیباگ اعلان وب‌پوش در سافاری iOS 17+.
۵. sqlite-zstd: فشرده‌سازی دیتابیس SQLite بدون کاهش سرعت خواندن و نوشتن.`,
    source_url: 'mailto:scheduled-tasks@cloud-agent.internal',
    source_name: 'Inbound Email: Cloud Agent',
    category: 'اتوماسیون و ابزارها',
    tags: ['Email', 'Automation', 'Gemini', 'Tools', 'GitHub'],
    is_read: false,
    is_favorite: true,
    is_archived: false,
    created_at: '2026-10-21T04:00:00Z',
    dedupe_hash: 'email_msg_id_77182',
  },

  // 6. Telegram post
  {
    id: 'item-106',
    type: 'telegram',
    title: 'نکات کلیدی برای طراحی PWA روی iOS و جلوگیری از رفرش ناخواسته',
    summary: 'راهنمای کاربردی برای ارگونومی بهتر در حالت Standalone سافاری آیفون: تنظیم safe-area، هندلینگ ژست لمسی و حفظ استیت آفلاین.',
    content: `فوروراد شده از @FrontendCraft:
وقتی کاربر اپلیکیشن را با گزینه "Add to Home Screen" در آیفون باز می‌کند:
۱. استفاده از viewport-fit=cover الزامی است تا حاشیه‌های ناچ و دکمه هوم پوشش داده شوند.
۲. برای دکمه‌های ناوبری حتماً ۴۴ پیکسل حداقل ارتفاع تاچ در نظر گرفته شود.
۳. مقدار 100dvh مانع پرش اسکرول حین باز شدن کیبورد مجازی می‌شود.
۴. استفاده از Stale-While-Revalidate برای درخواست‌های کش شده سرعت لود اولیه را مثل اپلیکیشن‌های بومی Swift به زیر ۵۰ میلی‌ثانیه می‌رساند.`,
    source_url: 'https://webkit.org/blog/pwa-standalone-best-practices',
    source_name: 'Telegram: @FrontendCraft',
    category: 'توسعه وب',
    tags: ['PWA', 'iOS', 'Safari', 'UI/UX', 'Mobile'],
    is_read: true,
    is_favorite: false,
    is_archived: false,
    created_at: '2026-10-20T21:10:00Z',
    dedupe_hash: 'tg_msg_77261',
  },

  // 7. Job radar
  {
    id: 'item-107',
    type: 'job',
    title: 'Lead Frontend Developer (React & TypeScript)',
    summary: 'رهبری تیم فرانت‌اند برای طراحی پلتفرم همکاری تیمی و چت، با تمرکز بر پرفورمنس بالا و طراحی ریسپانسیو فوق‌العاده.',
    content: `Join us as Lead Frontend Engineer.
You will be spearheading our UI engineering efforts, building high-speed real-time collaborative canvases and responsive dashboards.
Stack: React 19, TypeScript, Tailwind CSS, WebSockets, TanStack Query.
We offer competitive equity, flexible PTO, and async workflow.`,
    source_url: 'https://remoteok.com/remote-react-jobs',
    source_name: 'RemoteOK Job Radar',
    category: 'فرصت شغلی',
    tags: ['React', 'TypeScript', 'Tailwind', 'Lead', 'Remote'],
    is_read: false,
    is_favorite: false,
    is_archived: false,
    created_at: '2026-10-20T19:30:00Z',
    dedupe_hash: 'job_rem_9941',
    job_meta: {
      company: 'Aura Collab Inc.',
      location: 'Remote (US / Europe / MEA)',
      remote: true,
      salary_text: '$110,000 - $130,000 / yr',
      match_score: 88,
      match_reason: 'تطابق عالی مهارت‌های React و TypeScript و Tailwind، نقش لید با بازه درآمدی مناسب و کار تماماً ریموت.',
      status: 'applied',
    },
  },

  // 8. News
  {
    id: 'item-108',
    type: 'news',
    title: 'معرفی مدل سبک Gemini 2.5 Flash با سرعت پردازش ۲۰۰ توکن در ثانیه',
    summary: 'گوگل نسخه جدیدی از مدل بهینه‌شده Flash را با کاهش تاخیر تا ۴۰٪ و خروجی ساختاریافته JSON با قابلیت اعتبارسنجی خودکار عرضه کرد.',
    content: `Google has announced the widespread availability of the Gemini 2.5 Flash checkpoint.
Designed specifically for high-throughput automated background tasks, webhook processors, and summarization pipelines, the new model offers:
- Zero-shot JSON schema adherence with 99.8% precision.
- Built-in multi-lingual translation fidelity, with particular improvements in Persian, Arabic, and low-resource languages.
- Lower cost per million tokens, making daily RSS parsing and automated job scoring economically viable for indie developers.`,
    source_url: 'https://blog.google/technology/ai/gemini-2-5-flash-developer-update',
    source_name: 'TechCrunch AI',
    category: 'هوش مصنوعی',
    tags: ['Gemini', 'Google', 'AI', 'FastAPI', 'JSON Schema'],
    is_read: true,
    is_favorite: true,
    is_archived: false,
    created_at: '2026-10-20T17:00:00Z',
    dedupe_hash: 'news_tc_44182',
  },

  // 9. Job radar
  {
    id: 'item-109',
    type: 'job',
    title: 'Senior DevOps / Platform Engineer',
    summary: 'مدیریت کلاسترهای کوبرنتیز و پایپ‌لاین‌های اتوماسیون استقرار برای زیرساخت ابری با تمرکز بر امنیت و نظارت مداوم.',
    content: `Platform team is expanding:
Requirements: Kubernetes, Terraform, ArgoCD, Linux kernel tuning, Grafana/Prometheus.
Note: Primarily infrastructure focus with on-call rotation.`,
    source_url: 'https://remoteok.com/remote-devops-jobs',
    source_name: 'Jobinja Tech Radar',
    category: 'فرصت شغلی',
    tags: ['DevOps', 'Kubernetes', 'Docker', 'Linux'],
    is_read: true,
    is_favorite: false,
    is_archived: false,
    created_at: '2026-10-20T14:20:00Z',
    dedupe_hash: 'job_inj_33190',
    job_meta: {
      company: 'CloudPulse Hosting',
      location: 'Hybrid (Tehran / Remote)',
      remote: false,
      salary_text: 'تومان توافقی (بالای ۱۲۰ میلیون)',
      match_score: 62,
      match_reason: 'تمرکز کاری روی DevOps و نیاز به حضور هیبرید در دفتر، همخوانی کمتری با اولویت ریموت فول‌استک دارد.',
      status: 'rejected',
    },
  },

  // 10. Telegram post
  {
    id: 'item-110',
    type: 'telegram',
    title: 'الگوی Circuit Breaker و Retry با Exponential Backoff در FastAPI',
    summary: 'نمونه کد پایتون برای هندل کردن قطعی‌های لحظه‌ای وب‌سرویس‌های خارجی و هوش مصنوعی بدون معطل کردن صف کارها.',
    content: `فوروراد از کانال @PythonBestPractices:
هنگام ارسال درخواست به وب‌هوک‌ها یا API مدل‌های زبانی، استفاده از tenacity یا الگوی دستی exponential backoff همراه با جیتر (jitter) باعث می‌شود که در زمان‌های ترافیک بالا یا خطای ۴۲۹ سیستم کرش نکند.
کد کامل نمونه:
\`\`\`python
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(4), wait=wait_exponential(multiplier=1, min=2, max=10))
async def safe_fetch(client: httpx.AsyncClient, url: str):
    response = await client.get(url, timeout=10.0)
    response.raise_for_status()
    return response.text
\`\`\``,
    source_url: 'https://github.com/fastapi/resilience-patterns',
    source_name: 'Telegram: @PythonBestPractices',
    category: 'پایتون و بک‌اند',
    tags: ['Python', 'FastAPI', 'Async', 'Backend', 'Best Practices'],
    is_read: true,
    is_favorite: true,
    is_archived: false,
    created_at: '2026-10-20T11:45:00Z',
    dedupe_hash: 'tg_msg_66192',
  },

  // 11. News
  {
    id: 'item-111',
    type: 'news',
    title: 'استاندارد جدید وب‌پوش در مرورگر سافاری نسخه دسکتاپ و iOS ۱۸',
    summary: 'پشتیبانی یکپارچه از استانداردهای VAPID و اعلان‌های تعاملی بدون نیاز به حساب توسعه‌دهنده اپل.',
    content: `Apple WebKit team has unified Web Push protocols across iOS and macOS Safari.
Users can now receive instant system notifications from web apps installed on the home screen directly through standard W3C Push API specifications.
This enables personal dashboard creators to receive alerts for webhooks and background jobs without paying for Apple Developer Program membership.`,
    source_url: 'https://webkit.org/blog/14299/web-push-for-web-apps-on-ios-and-ipados',
    source_name: 'Apple WebKit Digest',
    category: 'فناوری و وب',
    tags: ['WebPush', 'iOS', 'Safari', 'PWA', 'Notifications'],
    is_read: false,
    is_favorite: false,
    is_archived: false,
    created_at: '2026-10-20T08:15:00Z',
    dedupe_hash: 'news_wk_3381',
  },

  // 12. Job radar
  {
    id: 'item-112',
    type: 'job',
    title: 'Senior Backend Engineer (FastAPI & Microservices)',
    summary: 'توسعه موتور پردازش داده بلادرنگ در حوزه معاملات مالی، معماری مایکروسرویس و مقیاس‌پذیری عمودی.',
    content: `FinTech scaleup looking for Senior Backend Engineer.
Responsibilities:
- Write high-concurrency async endpoints with FastAPI.
- Maintain Alembic database migrations and PostgreSQL connection pools.
- Write thorough unit and integration tests using pytest and pytest-asyncio.`,
    source_url: 'https://remoteok.com/remote-python-jobs',
    source_name: 'RemoteOK Job Radar',
    category: 'فرصت شغلی',
    tags: ['FastAPI', 'Python', 'PostgreSQL', 'Fintech', 'Remote'],
    is_read: false,
    is_favorite: true,
    is_archived: false,
    created_at: '2026-10-19T22:00:00Z',
    dedupe_hash: 'job_fin_1002',
    job_meta: {
      company: 'HyperYield Finance',
      location: 'Remote (EMEA / UTC+3 to UTC+5)',
      remote: true,
      salary_text: '$105,000 - $125,000 / yr',
      match_score: 94,
      match_reason: 'تطابق عالی مهارت‌های FastAPI، تست‌نویسی، معماری دیتابیس و زمان‌بندی هم‌پوشان با منطقه زمانی.',
      status: 'interview',
    },
  },

  // 13. Telegram post
  {
    id: 'item-113',
    type: 'telegram',
    title: 'تکنیک استخراج هوشمند متن مقالات با کتابخانه Trafilatura',
    summary: 'معرفی روش‌های پاک‌سازی صفحات وب قبل از فرستادن به مدل زبانی جهت حذف نویز و کاهش حجم توکن‌ها.',
    content: `تکنیک جالب از @PythonDataScience:
برای ربات‌های خلاصه ساز لینک‌های تلگرامی، استفاده از Beautifulsoup ساده معمولاً کلی کدهای تبلیغاتی و منو را باقی می‌گذارد.
کتابخانه Trafilatura متن اصلی مقالات را با الگوریتم‌های اکتشافی تمیز استخراج می‌کند و لینک‌ها و متادیتاها را در قالبی مرتب تحویل می‌دهد که آماده ورود به پرامپت Gemini است.`,
    source_url: 'https://trafilatura.readthedocs.io/en/latest/',
    source_name: 'Telegram: @PythonDataScience',
    category: 'پایتون و بک‌اند',
    tags: ['Trafilatura', 'Python', 'Scraping', 'RSS', 'AI'],
    is_read: true,
    is_favorite: false,
    is_archived: false,
    created_at: '2026-10-19T18:30:00Z',
    dedupe_hash: 'tg_msg_55219',
  },

  // 14. Email
  {
    id: 'item-114',
    type: 'email',
    title: 'بررسی وضعیت سلامت پایگاه‌داده و لاگ‌های وب‌هوک تلگرام',
    summary: 'گزارش هفتگی پایگاه داده SQLite و عملکرد تسک‌های پس‌زمینه: ۹۹.۸٪ موفقیت در انریچینگ هوش مصنوعی.',
    content: `تسک خودکار نگهداری:
- حجم دیتابیس: 18.4 مگابایت
- تعداد کل آیتم‌های ذخیره شده: ۴۲۱ رکورد
- زمان متوسط پاسخ به وب‌هوک تلگرام: ۲۱۰ میلی‌ثانیه (تسک‌های هوش مصنوعی کاملاً در بک‌گراند اجرا شده‌اند)
- خطاهای متوقف شده: ۰ مورد
وضعیت کلی: عالی و پایدار.`,
    source_url: 'mailto:system-monitor@hub.local',
    source_name: 'Inbound Email: Health Check',
    category: 'پایش سیستم',
    tags: ['Database', 'SQLite', 'Monitoring', 'FastAPI'],
    is_read: true,
    is_favorite: false,
    is_archived: false,
    created_at: '2026-10-19T12:00:00Z',
    dedupe_hash: 'email_msg_id_66219',
  },

  // 15. News
  {
    id: 'item-115',
    type: 'news',
    title: 'رشد چشمگیر استارتاپ‌های Remote-First در اکوسیستم فناوری اروپا',
    summary: 'گزارش سالانه اکوسیستم استارتاپی نشان می‌دهد بیش از ۷۰ درصد از جذب نیروهای جدید در شرکت‌های نرم‌افزاری به صورت کاملاً ریموت انجام می‌شود.',
    content: `The European Tech Talent Survey 2026 reveals a decisive trend towards distributed-first software organizations.
Companies offering asynchronous workflows and geographical flexibility have reported 45% faster hiring cycles for senior engineers and architects compared to rigid onsite models.
Popular hub cities for remote contract talent include Berlin, Amsterdam, Tbilisi, and Dubai.`,
    source_url: 'https://sifted.eu/articles/remote-first-tech-hiring-trends-2026',
    source_name: 'Tech In Asia & Europe',
    category: 'کسب‌وکار و فناوری',
    tags: ['Remote', 'Career', 'Startups', 'Tech Trends'],
    is_read: true,
    is_favorite: false,
    is_archived: false,
    created_at: '2026-10-19T09:00:00Z',
    dedupe_hash: 'news_sift_192',
  },

  // 16. Job radar
  {
    id: 'item-116',
    type: 'job',
    title: 'Senior AI Application Developer',
    summary: 'پیاده‌سازی رابط‌های کاربری هوشمند، جریان‌های جستجوی معنایی و ابزارهای تحلیلی با استفاده از مدل‌های زبانی مدرن.',
    content: `We are building the next generation of knowledge orchestration tools.
Stack: Python, FastAPI, React, Vector Search, Gemini SDK.
Competitive benefits package, equipment allowance, and annual retreat.`,
    source_url: 'https://remoteok.com/remote-ai-jobs',
    source_name: 'WeWorkRemotely',
    category: 'فرصت شغلی',
    tags: ['AI', 'Python', 'React', 'TypeScript', 'Remote'],
    is_read: false,
    is_favorite: true,
    is_archived: false,
    created_at: '2026-10-18T20:45:00Z',
    dedupe_hash: 'job_wwr_9981',
    job_meta: {
      company: 'OmniKnowledge AI',
      location: 'Remote (Worldwide)',
      remote: true,
      salary_text: '$115,000 - $135,000 / yr',
      match_score: 93,
      match_reason: 'تطابق کامل با حوزه فعالیت Knowledge Hub، تسلط بر مدل‌های زبانی و فناوری‌های انتخابی شما.',
      status: 'saved',
    },
  },

  // 17. Telegram
  {
    id: 'item-117',
    type: 'telegram',
    title: 'راهنمای راه‌اندازی ربات تلگرام با وب‌هوک و امنیت Secret Token در FastAPI',
    summary: 'آموزش احراز هویت درخواست‌های ورودی از سرورهای تلگرام با هدر X-Telegram-Bot-Api-Secret-Token و بررسی شناسه کاربری مجاز.',
    content: `نکته امنیتی برای ربات‌های اختصاصی تلگرام:
برای جلوگیری از اسپم یا حملات فیک به وب‌هوک سرور:
۱. حتماً هنگام ثبت وب‌هوک پارامتر secret_token را تعیین کنید.
۲. در متد پست FastAPI این هدر را اعتبارسنجی کنید:
\`\`\`python
async def telegram_webhook(
    request: Request,
    x_telegram_bot_api_secret_token: str = Header(None)
):
    if x_telegram_bot_api_secret_token != settings.TELEGRAM_SECRET:
        raise HTTPException(status_code=403, detail="Unauthorized")
\`\`\`
۳. فقط پیام‌هایی را ذخیره و پردازش کنید که from_user.id با TELEGRAM_OWNER_ID مطابقت داشته باشد.`,
    source_url: 'https://core.telegram.org/bots/api#setwebhook',
    source_name: 'Telegram: @PythonSecurity',
    category: 'امنیت و وب‌هوک',
    tags: ['Telegram', 'FastAPI', 'Security', 'Webhooks'],
    is_read: true,
    is_favorite: false,
    is_archived: false,
    created_at: '2026-10-18T16:00:00Z',
    dedupe_hash: 'tg_msg_44102',
  },

  // 18. News
  {
    id: 'item-118',
    type: 'news',
    title: 'پایگاه داده جدید sqlite-vec برای جستجوی برداری آفلاین روی سرورهای سبک',
    summary: 'اکستنشن سبک C برای SQLite که امکان جستجوی همسایگی برداری را مستقیماً روی فایل SQLite با سرعتی باورنکردنی فراهم می‌کند.',
    content: `sqlite-vec is a zero-dependency vector search extension for SQLite written in pure C.
It allows developers to store text embeddings alongside traditional relational rows in SQLite, executing Cosine or L2 distance similarity queries without spinning up complex external vector services like Pinecone or Qdrant.`,
    source_url: 'https://github.com/asg017/sqlite-vec',
    source_name: 'Hacker News Digest',
    category: 'دیتابیس و AI',
    tags: ['SQLite', 'Embeddings', 'Vector Search', 'OpenSource'],
    is_read: false,
    is_favorite: true,
    is_archived: false,
    created_at: '2026-10-18T13:20:00Z',
    dedupe_hash: 'news_hn_88291',
  },

  // 19. Job radar
  {
    id: 'item-119',
    type: 'job',
    title: 'Junior WordPress Developer',
    summary: 'توسعه و پشتیبانی پوسته‌ها و افزونه‌های وردپرس برای فروشگاه‌های اینترنتی سنتی به صورت حضوری در اصفهان.',
    content: `به یک برنامه‌نویس جونیور وردپرس مسلط به PHP 7، قالب‌های ووکامرس و رفع ایرادات فنی سایت نیازمندیم.
محل کار: دفتر اصفهان (حضوری).`,
    source_url: 'https://jobinja.ir/jobs?filters%5Bkeywords%5D%5B%5D=WordPress',
    source_name: 'Jobinja Tech Radar',
    category: 'فرصت شغلی',
    tags: ['WordPress', 'PHP', 'Onsite', 'Junior'],
    is_read: true,
    is_favorite: false,
    is_archived: true,
    created_at: '2026-10-18T10:00:00Z',
    dedupe_hash: 'job_inj_1192',
    job_meta: {
      company: 'آژانس طراحی وب پارس',
      location: 'Isfahan (Onsite)',
      remote: false,
      salary_text: '۱۸ - ۲۴ میلیون تومان',
      match_score: 18,
      match_reason: 'سطح شغلی جونیور است، نیازمند حضور فیزیکی در اصفهان بوده و مهارت‌ها (وردپرس) در لیست سیاه پروفایل شما قرار دارند.',
      status: 'rejected',
    },
  },

  // 20. Telegram post
  {
    id: 'item-120',
    type: 'telegram',
    title: 'قالب‌های انیمیشن Framer Motion برای اپ‌های PWA روی موبایل',
    summary: 'ترفندهای شبیه‌سازی انیمیشن‌های روان بومی iOS مثل باز شدن شیت از پایین و تغییر نرم تب‌ها بدون پرش فریم.',
    content: `از کانال @DesignSystems:
برای داشتن حس و حال بومی اپل (Apple-like feel) در صفحات وب:
- از ترنزیشن با تایمینگ spring و مقادیر damping: 28 و stiffness: 320 استفاده کنید.
- برای سوایپ کارت‌ها کشش الاستیک بگذارید تا کاربر حس لمس شیء فیزیکی را داشته باشد.
- استیت باز شدن کارت‌ها را با AnimatePresence مدیریت کنید تا خروج المان نیز نرم باشد.`,
    source_url: 'https://motion.dev/docs/springs',
    source_name: 'Telegram: @DesignSystems',
    category: 'طراحی رابط کاربری',
    tags: ['Framer Motion', 'UI/UX', 'Mobile', 'iOS', 'Animation'],
    is_read: true,
    is_favorite: true,
    is_archived: false,
    created_at: '2026-10-17T19:00:00Z',
    dedupe_hash: 'tg_msg_33100',
  },
];
