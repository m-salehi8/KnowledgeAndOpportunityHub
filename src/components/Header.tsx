import React, { useEffect, useState } from 'react';
import { Moon, RefreshCw, Sun } from 'lucide-react';
import { useApp, TabType } from '../context/AppContext';

interface PageMeta {
  title: string;
  subtitle: string;
}

const PAGE_META: Record<TabType, PageMeta> = {
  inbox: { title: 'ورودی', subtitle: 'پیام‌ها، اخبار و فرصت‌های امروز' },
  jobs: { title: 'رادار شغلی', subtitle: 'امتیازدهی هوشمند فرصت‌ها' },
  producthunt: { title: 'پروداکت هانت', subtitle: 'دایجست روزانه محصولات' },
  projects: { title: 'پروژه‌ها', subtitle: 'ابزارها، ایده‌ها و تلگرام' },
  search: { title: 'جستجو', subtitle: 'کاوش در دانش و فرصت‌ها' },
  saved: { title: 'نشان‌شده', subtitle: 'آرشیو و موارد منتخب شما' },
  settings: { title: 'تنظیمات', subtitle: 'پروفایل، منابع و اعلان‌ها' },
};

export const Header: React.FC = () => {
  const { theme, setTheme, activeTab, runJob, isRunningJob } = useApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const meta = PAGE_META[activeTab];
  const isJobs = activeTab === 'jobs';
  const isLongTitle = meta.title.length > 10;
  const runLabel = isJobs ? 'اسکن رادار' : 'به‌روزرسانی';

  return (
    <header className={`ios-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="pt-safe px-4 pb-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p
              className="ios-eyebrow overflow-hidden transition-all duration-300"
              style={{
                maxHeight: scrolled ? 0 : 16,
                opacity: scrolled ? 0 : 1,
                transform: scrolled ? 'translateY(-4px)' : 'translateY(0)',
              }}
            >
              Knowledge &amp; Opportunity Hub
            </p>

            <h1
              className={`ios-large-title truncate ${isLongTitle ? 'is-long' : ''} ${
                scrolled ? 'is-compact' : ''
              }`}
            >
              {meta.title}
            </h1>

            <div
              className="overflow-hidden transition-all duration-300"
              style={{
                maxHeight: scrolled ? 0 : 22,
                opacity: scrolled ? 0 : 1,
                transform: scrolled ? 'translateY(-3px)' : 'translateY(0)',
              }}
            >
              <p className="ios-subtitle mt-0.5 truncate">{meta.subtitle}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => (isJobs ? runJob('jobs') : runJob('news'))}
              disabled={isRunningJob}
              className="ios-action-pill disabled:opacity-50"
              title={isJobs ? 'اجرای رادار شغلی' : 'به‌روزرسانی فیدها'}
              aria-label={isJobs ? 'اجرای رادار شغلی' : 'به‌روزرسانی فیدها'}
            >
              <RefreshCw className={`h-3.5 w-3.5 text-cyan-300 ${isRunningJob ? 'animate-spin' : ''}`} />
              <span className={scrolled ? 'hidden' : 'inline'}>{isRunningJob ? 'در حال اجرا' : runLabel}</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="ios-icon-button"
              aria-label="تغییر حالت نمایش"
              title={theme === 'dark' ? 'حالت روشن' : 'حالت تاریک'}
            >
              {theme === 'dark' ? (
                <Sun className="h-[18px] w-[18px] text-amber-300" />
              ) : (
                <Moon className="h-[18px] w-[18px] text-indigo-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
