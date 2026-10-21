import React from 'react';
import {
  Inbox,
  Compass,
  Rocket,
  FolderKanban,
  Search,
  Bookmark,
  Settings2,
  Sparkles,
  Sun,
  Moon,
  RefreshCw,
  Zap,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { useApp, TabType } from '../context/AppContext';
import { toPersianDigits } from '../utils/format';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const DesktopSidebar: React.FC = () => {
  const { activeTab, setActiveTab, stats, theme, setTheme, runJob, isRunningJob } = useApp();

  const navItems: NavItem[] = [
    {
      id: 'inbox',
      label: 'صندوق ورودی',
      icon: Inbox,
      badge: stats?.unread_count,
    },
    {
      id: 'jobs',
      label: 'رادار شغل (جابینجا و جاب‌ویژن)',
      icon: Compass,
      badge: stats?.high_match_jobs,
    },
    {
      id: 'producthunt',
      label: 'دایجست Product Hunt',
      icon: Rocket,
    },
    {
      id: 'projects',
      label: 'ابزارها، پروژه‌ها و تلگرام',
      icon: FolderKanban,
      badge: stats?.projects_count || 5,
    },
    {
      id: 'search',
      label: 'جستجوی پیشرفته',
      icon: Search,
    },
    {
      id: 'saved',
      label: 'نشان‌شده‌ها و آرشیو',
      icon: Bookmark,
      badge: stats?.saved_count,
    },
    {
      id: 'settings',
      label: 'تنظیمات و وب‌هوک‌ها',
      icon: Settings2,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 h-screen sticky top-0 bg-white/90 dark:bg-[#0E0E16]/95 backdrop-blur-xl border-s border-slate-200/80 dark:border-white/10 p-4 transition-colors duration-200 overflow-y-auto scrollbar-none z-30">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-4 border-b border-slate-100 dark:border-white/5">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="truncate">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              هاب دانش و فرصت‌ها
            </h1>
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-mono text-[9px] font-bold">
              PRO
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            Knowledge & Opportunity Hub
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1 flex-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          منوی ناوبری
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          const badgeCount = item.badge && item.badge > 0 ? item.badge : 0;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span>{item.label}</span>
              </div>

              {badgeCount > 0 && (
                <span
                  className={`min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full flex items-center justify-center font-mono ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400'
                  }`}
                >
                  {toPersianDigits(badgeCount)}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Automation Actions */}
        <div className="pt-5 mt-4 border-t border-slate-100 dark:border-white/5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>عملیات خودکار هوش مصنوعی</span>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => runJob('jobs')}
              disabled={isRunningJob}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-white/5 transition-all disabled:opacity-50"
            >
              <span>اجرای رادار شغلی</span>
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningJob ? 'animate-spin text-indigo-500' : ''}`} />
            </button>

            <button
              onClick={() => runJob('news')}
              disabled={isRunningJob}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-white/5 transition-all disabled:opacity-50"
            >
              <span>تحلیل و خلاصه‌سازی اخبار</span>
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningJob ? 'animate-spin text-indigo-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Overview Card */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 text-[11px]">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              وضعیت دیتابیس
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-white dark:bg-black/30 p-1.5 rounded-lg border border-slate-200/40 dark:border-white/5">
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {toPersianDigits(stats?.total_items || 0)}
              </span>
              <p className="text-[9px] text-slate-500">کل ذخیره‌ها</p>
            </div>
            <div className="bg-white dark:bg-black/30 p-1.5 rounded-lg border border-slate-200/40 dark:border-white/5">
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {toPersianDigits(stats?.high_match_jobs || 0)}
              </span>
              <p className="text-[9px] text-slate-500">جاب‌های تاپ</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer / Theme & System Info */}
      <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
            <span>{theme === 'dark' ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک'}</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400 uppercase">
            {theme === 'dark' ? 'DARK' : 'LIGHT'}
          </span>
        </button>

        <div className="flex items-center gap-2.5 px-2 py-1 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="truncate">وب‌هوک تلگرام و ایمیل فعال</span>
        </div>
      </div>
    </aside>
  );
};
