// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Moon, RefreshCw, Sun } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useApp, TabType } from '../context/AppContext';
import { hapticTap } from '../utils/haptics';

interface PageMeta {
  title: string;
  subtitle: string;
  refresh?: 'news' | 'jobs';
}

const PAGE_META: Record<TabType, PageMeta> = {
  inbox: { title: 'ورودی', subtitle: 'پیام‌ها، اخبار و فرصت‌های امروز', refresh: 'news' },
  jobs: { title: 'شغل‌ها', subtitle: 'رادار هوشمند فرصت‌های شغلی', refresh: 'jobs' },
  search: { title: 'جستجو', subtitle: 'کاوش در دانش و فرصت‌ها' },
  saved: { title: 'ذخیره‌شده‌ها', subtitle: 'موارد منتخب و آرشیو شما' },
  settings: { title: 'تنظیمات', subtitle: 'پروفایل، منابع و اعلان‌ها' },
};

export const Header: React.FC = () => {
  const { resolvedTheme, setTheme, activeTab, inboxSection, runJob, isRunningJob } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const meta = PAGE_META[activeTab];

  const title =
    activeTab === 'inbox' && inboxSection === 'projects'
      ? 'پروژه‌ها'
      : activeTab === 'inbox' && inboxSection === 'producthunt'
        ? 'پروداکت'
        : meta.title;

  const subtitle =
    activeTab === 'inbox' && inboxSection === 'projects'
      ? 'ابزارها، ایده‌ها و تلگرام'
      : activeTab === 'inbox' && inboxSection === 'producthunt'
        ? 'دایجست روزانه محصولات'
        : meta.subtitle;

  const handleRefresh = () => {
    if (!meta.refresh) return;
    hapticTap();
    runJob(meta.refresh);
  };

  const handleTheme = () => {
    hapticTap();
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className={`ios-nav-bar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="pt-safe px-4">
        {/* Nav bar row */}
        <div className="flex h-11 items-center gap-3">
          <div className="min-w-0 flex-1">
            <AnimatePresence initial={false} mode="popLayout">
              {scrolled && (
                <motion.h1
                  key="inline-title"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="ios-inline-title truncate"
                >
                  {title}
                </motion.h1>
              )}
            </AnimatePresence>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {meta.refresh && (
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRunningJob}
                aria-label={meta.refresh === 'jobs' ? 'اجرای رادار شغلی' : 'به‌روزرسانی فیدها'}
                title={meta.refresh === 'jobs' ? 'اجرای رادار شغلی' : 'به‌روزرسانی فیدها'}
                className="ios-icon-button h-9 w-9 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-[18px] w-[18px] ${isRunningJob ? 'animate-spin' : ''}`}
                  strokeWidth={1.75}
                />
              </button>
            )}

            <button
              type="button"
              onClick={handleTheme}
              className="ios-icon-button h-9 w-9"
              aria-label={resolvedTheme === 'dark' ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک'}
              title={resolvedTheme === 'dark' ? 'حالت روشن' : 'حالت تاریک'}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} />
              ) : (
                <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>

        {/* Large title block */}
        <motion.div
          animate={
            scrolled
              ? { height: 0, opacity: 0, marginBottom: 0 }
              : { height: 'auto', opacity: 1, marginBottom: 6 }
          }
          initial={false}
          transition={{ duration: reduce ? 0 : 0.24, ease: [0.32, 0.72, 0, 1] }}
          className="overflow-hidden"
        >
          <p className="ios-eyebrow mb-1">Knowledge &amp; Opportunity Hub</p>
          <h1 className="ios-large-title">{title}</h1>
          <p className="ios-subtitle mt-0.5">{subtitle}</p>
        </motion.div>
      </div>
    </header>
  );
};
