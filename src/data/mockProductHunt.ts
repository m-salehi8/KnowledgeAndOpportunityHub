import { ProductHuntDailyDigest } from '../types';

export const initialProductHuntDigest: ProductHuntDailyDigest = {
  id: 'ph-digest-latest',
  date_formatted: 'امروز - ۲۲ اکتبر ۲۰۲۶',
  created_at: new Date().toISOString(),
  total_products: 7,
  products: [
    {
      name: 'BAND for Developers',
      tagline: 'تیم‌سازی و ارکستراسیون ایجنت‌های کدنویسی خودکار',
      url: 'https://www.producthunt.com/products/band',
      problem_solved:
        'ایجنت‌های کدنویسی فعلی به شکل انفرادی کار می‌کنند و نمی‌توانند مانند یک تیم نرم‌افزاری واقعی وظایف پیچیده و چندلایه را بین خود تقسیم و اعتبارسنجی کنند.',
      target_audience: 'مهندسان ارشد نرم‌افزار، لیدهای فنی و تیم‌های توسعه چابک',
      pricing_model: 'فری‌میوم (نسخه پایه رایگان، اشتراک تیمی ۲۹ دلار در ماه به ازای هر صندلی)',
      tags: ['AI Agents', 'DevTools', 'Coding', 'OpenSource Core'],
      is_ai: true,
    },
    {
      name: 'FastFlow API Gateway',
      tagline: 'درگاه پرسرعت توزیع‌شده با قابلیت کش معنایی و مدیریت هزینه مدل‌ها',
      url: 'https://www.producthunt.com/products/fastflow-gateway',
      problem_solved:
        'هزینه سرسام‌آور درخواست‌های تکراری به <bdi dir="ltr">LLM</bdi>ها و تأخیر بالا در فراخوانی‌های مکرر <bdi dir="ltr">API</bdi>های هوش مصنوعی.',
      target_audience: 'توسعه‌دهندگان بک‌اند پایتون، مهندسان سیستم‌های توزیع‌شده و استارتاپ‌های هوش مصنوعی',
      pricing_model: 'رایگان تا ۵۰ هزار درخواست، سپس بر اساس حجم مصرف (<bdi dir="ltr">Pay as you go</bdi>)',
      tags: ['API Gateway', 'LLM Ops', 'Semantic Cache', 'Backend'],
      is_ai: true,
    },
    {
      name: 'ScrapeMind V2',
      tagline: 'استخراج هوشمند داده از وب بدون نیاز به نگهداری سلکتورها',
      url: 'https://www.producthunt.com/products/scrapemind-v2',
      problem_solved:
        'شکستن اسکریپت‌های اسکرپینگ وب با هر بار تغییر کدهای <bdi dir="ltr">HTML/CSS</bdi> سایت‌ها.',
      target_audience: 'متخصصان داده‌کاوی، تحلیلگران بازار و توسعه‌دهندگان وب اسکرپینگ',
      pricing_model: 'اشتراک ماهانه از ۱۹ دلار تا ۱۹۹ دلار همراه با پروکسی‌های چرخشی رایگان',
      tags: ['Web Scraping', 'Automation', 'Data Extraction'],
      is_ai: true,
    },
    {
      name: 'DocuSync Live',
      tagline: 'همگام‌سازی بلادرنگ پایگاه دانش با وب‌هوک و نوتیفیکیشن وب‌پوش',
      url: 'https://www.producthunt.com/products/docusync-live',
      problem_solved:
        'پراکندگی اطلاعات فنی بین ابزارهایی مثل تلگرام، گیت‌هاب و اسلک بدون یک داشبورد متمرکز.',
      target_audience: 'توسعه‌دهندگان مستقل (<bdi dir="ltr">Indie Hackers</bdi>) و تیم‌های دورکار',
      pricing_model: 'کامل رایگان برای استفاده شخصی، نسخه سازمانی توافقی',
      tags: ['Productivity', 'PWA', 'Knowledge Hub'],
      is_ai: false,
    },
    {
      name: 'PromptRefine Studio',
      tagline: 'پلتفرم ارزیابی خودکار و تست رگرسیون پرامپت‌های مدل‌های زبانی',
      url: 'https://www.producthunt.com/products/promptrefine-studio',
      problem_solved:
        'نبود ابزار سنجش استاندارد برای سنجش خروجی پرامپت‌ها قبل از دپلوی به پروداکشن.',
      target_audience: 'مهندسان پرامپت و معماران <bdi dir="ltr">AI Systems</bdi>',
      pricing_model: 'رایگان در نسخه <bdi dir="ltr">Open Source</bdi> محلی، ابر سازمانی ماهانه ۴۹ دلار',
      tags: ['LLM Testing', 'Developer Tools', 'AI Evaluation'],
      is_ai: true,
    },
  ],
  ai_spotlight: `
<div class="space-y-4 text-sm leading-relaxed">
  <p>
    در بررسی محصولات ۲۴ ساعت گذشته، تمرکز عمده اکوسیستم بر بلوغ معماری 
    <bdi dir="ltr">Agentic Workflows</bdi> و پروتکل‌های نوین تبادل داده مانند 
    <bdi dir="ltr">MCP (Model Context Protocol)</bdi> است. 
    برخلاف موج‌های ابتدایی که صرفاً پوسته‌ای روی <bdi dir="ltr">OpenAI API</bdi> بودند، نسل جدید ابزارهایی مانند 
    <bdi dir="ltr">BAND</bdi> و <bdi dir="ltr">FastFlow</bdi> دارای زیرساخت مستقل برای ارکستراسیون چند ایجنتی 
    (<bdi dir="ltr">Multi-Agent Orchestration</bdi>) و کش معنایی در سطح شبکه هستند.
  </p>
  <div class="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/20">
    <h5 class="font-bold text-indigo-700 dark:text-indigo-300 mb-1.5 flex items-center gap-2">
      <span>💡 ارزش افزوده فنی کلیدی:</span>
    </h5>
    <ul class="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
      <li>استفاده از کش وکتوری (<bdi dir="ltr">Vector Semantic Caching</bdi>) با پایگاه‌های <bdi dir="ltr">Redis</bdi> جهت کاهش تا ۶۵٪ هزینه‌های توکن.</li>
      <li>جداسازی لایه‌های اجرا و برنامه‌ریزی (<bdi dir="ltr">Planner-Executor Separation</bdi>) برای پیشگیری از هذیان مدل.</li>
      <li>پشتیبانی پیش‌فرض از وب‌پوش و وب‌هوک برای یکپارچگی بدون قطعی با سیستم‌های بک‌اند.</li>
    </ul>
  </div>
</div>
  `.trim(),
  idea_takeaway: `
<div class="space-y-4 text-sm leading-relaxed">
  <p>
    تحلیل محصولات امروز نشان‌دهنده یک فرصت کم‌نظیر برای توسعه‌دهندگان بک‌اند پایتون و سازندگان 
    <bdi dir="ltr">Micro-SaaS</bdi> است:
  </p>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
    <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
      <h6 class="font-bold text-emerald-600 dark:text-emerald-400 mb-1">🎯 پتانسیل بومی‌سازی در بازار ایران:</h6>
      <p class="text-xs text-slate-600 dark:text-slate-300 leading-normal">
        ساخت یک سرویس وب اسکرپینگ تخصصی برای پورتال‌های استخدامی و مناقصات ایران با فریم‌ورک 
        <bdi dir="ltr">Scrapy</bdi> و مدل‌های ارزیابی سریع، نیاز مبرم شرکت‌های داده‌محور است.
      </p>
    </div>
    <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
      <h6 class="font-bold text-violet-600 dark:text-violet-400 mb-1">🚀 ایده Micro-SaaS مستقل:</h6>
      <p class="text-xs text-slate-600 dark:text-slate-300 leading-normal">
        ابزار مانیتورینگ اختصاصی <bdi dir="ltr">LLM</bdi> که به عنوان یک لایه پراکسی بین سرویس‌های بک‌اند جنگو/<bdi dir="ltr">FastAPI</bdi> و مدل‌ها قرار گرفته و آمار خطا و هزینه را پوش‌نوتیفیکیشن می‌کند.
      </p>
    </div>
  </div>
</div>
  `.trim(),
};
