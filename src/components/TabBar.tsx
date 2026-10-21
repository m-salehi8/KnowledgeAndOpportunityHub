import React from 'react';
import { Inbox, Compass, Rocket, FolderKanban, Search, Settings2 } from 'lucide-react';
import { useApp, TabType } from '../context/AppContext';
import { toPersianDigits } from '../utils/format';

interface TabItem {
  id: TabType;
  labelKey: 'tab_inbox' | 'tab_jobs' | 'tab_producthunt' | 'tab_projects' | 'tab_search' | 'tab_saved' | 'tab_settings';
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab, t, stats, lang } = useApp();

  const tabs: TabItem[] = [
    {
      id: 'inbox',
      labelKey: 'tab_inbox',
      icon: Inbox,
      badge: stats?.unread_count,
    },
    {
      id: 'jobs',
      labelKey: 'tab_jobs',
      icon: Compass,
      badge: stats?.high_match_jobs,
    },
    {
      id: 'producthunt',
      labelKey: 'tab_producthunt',
      icon: Rocket,
    },
    {
      id: 'projects',
      labelKey: 'tab_projects',
      icon: FolderKanban,
      badge: stats?.projects_count || 5,
    },
    {
      id: 'search',
      labelKey: 'tab_search',
      icon: Search,
    },
    {
      id: 'settings',
      labelKey: 'tab_settings',
      icon: Settings2,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0B0B0F]/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors duration-200"
      role="navigation"
      aria-label="Bottom Navigation"
    >
      <div className="max-w-md mx-auto px-2 pt-2 pb-safe flex items-center justify-between">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const badgeCount = tab.badge && tab.badge > 0 ? tab.badge : 0;
          const badgeText = lang === 'fa' ? toPersianDigits(badgeCount) : String(badgeCount);

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[46px] rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              aria-selected={isActive}
              aria-label={t[tab.labelKey]}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {badgeCount > 0 && (
                  <span className="absolute -top-1.5 -end-2 min-w-[17px] h-[17px] px-1 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {badgeText}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[64px]">
                {t[tab.labelKey]}
              </span>
              {isActive && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
