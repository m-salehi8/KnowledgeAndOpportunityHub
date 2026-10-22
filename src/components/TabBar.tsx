import React from 'react';
import { Inbox, Compass, Rocket, FolderKanban, Search, Bookmark, Settings2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp, TabType } from '../context/AppContext';
import { toPersianDigits } from '../utils/format';

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface TabBarProps {
  detailOpen?: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({ detailOpen = false }) => {
  const { activeTab, setActiveTab, stats, lang } = useApp();

  const tabs: TabItem[] = [
    { id: 'inbox', label: 'ورودی', icon: Inbox, badge: stats?.unread_count },
    { id: 'jobs', label: 'رادار', icon: Compass, badge: stats?.high_match_jobs },
    { id: 'producthunt', label: 'پروداکت', icon: Rocket },
    { id: 'projects', label: 'پروژه', icon: FolderKanban, badge: stats?.projects_count || 0 },
    { id: 'search', label: 'جستجو', icon: Search },
    { id: 'saved', label: 'ذخیره', icon: Bookmark, badge: stats?.saved_count },
    { id: 'settings', label: 'تنظیمات', icon: Settings2 },
  ];

  return (
    <nav
      className="dock-safe fixed left-0 right-0 z-50 mx-auto w-full max-w-[430px] px-3.5 pointer-events-none"
      role="navigation"
      aria-label="ناوبری پایین"
      dir="rtl"
      style={{
        transform: detailOpen ? 'translateY(7px) scale(0.955)' : 'none',
        transformOrigin: 'center bottom',
        transition: 'transform 0.42s cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      <div className="ios-glass-dock ios-specular pointer-events-auto flex items-center justify-between gap-0.5 rounded-full px-1.5 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const badgeCount = tab.badge && tab.badge > 0 ? tab.badge : 0;
          const badgeText = lang === 'fa' ? toPersianDigits(badgeCount) : String(badgeCount);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="relative flex h-[52px] min-w-0 flex-1 flex-col items-center justify-center rounded-full transition-transform duration-200 active:scale-95"
              aria-selected={isActive}
              aria-label={tab.label}
            >
              {isActive && (
                <motion.span
                  layoutId="ios-active-tab-lens"
                  className="absolute inset-x-0.5 inset-y-0.5 rounded-full"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(56,189,248,0.3) 0%, rgba(14,165,233,0.14) 100%)',
                    border: '1px solid rgba(125,211,252,0.45)',
                    boxShadow:
                      'inset 0 1px 1px rgba(255,255,255,0.45), 0 4px 14px rgba(14,165,233,0.25)',
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }}
                />
              )}

              <span className="relative z-10 flex flex-col items-center gap-[3px]">
                <span className="relative">
                  <Icon
                    className={`h-[19px] w-[19px] transition-all duration-200 ${
                      isActive
                        ? 'scale-105 stroke-[2.4] text-cyan-100'
                        : 'stroke-[1.8] text-slate-400 dark:text-slate-400'
                    }`}
                  />
                  {badgeCount > 0 && (
                    <span className="absolute -top-2 -end-2.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full border border-white/30 bg-gradient-to-b from-rose-400 to-rose-600 px-1 text-[9px] font-bold leading-none text-white shadow-[0_2px_8px_rgba(239,68,68,0.55)]">
                      {badgeText}
                    </span>
                  )}
                </span>
                <span
                  className={`whitespace-nowrap text-[9px] leading-none tracking-tight transition-colors ${
                    isActive
                      ? 'font-bold text-cyan-50'
                      : 'font-medium text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {tab.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
