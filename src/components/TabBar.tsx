import React from 'react';
import { Inbox, Briefcase, Search, Bookmark, SlidersHorizontal } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useApp, TabType } from '../context/AppContext';
import { toPersianDigits } from '../utils/format';
import { hapticTap } from '../utils/haptics';
import { SPRING } from './ui';

interface TabItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: number;
}

interface TabBarProps {
  detailOpen?: boolean;
}

export const TabBar: React.FC<TabBarProps> = ({ detailOpen = false }) => {
  const { activeTab, setActiveTab, stats, lang } = useApp();
  const reduce = useReducedMotion();

  const tabs: TabItem[] = [
    { id: 'inbox', label: 'ورودی', icon: Inbox, badge: stats?.unread_count },
    { id: 'jobs', label: 'شغل‌ها', icon: Briefcase, badge: stats?.high_match_jobs },
    { id: 'search', label: 'جستجو', icon: Search },
    { id: 'saved', label: 'ذخیره‌شده‌ها', icon: Bookmark, badge: stats?.saved_count },
    { id: 'settings', label: 'تنظیمات', icon: SlidersHorizontal },
  ];

  return (
    <nav
      className="ios-tab-bar"
      role="tablist"
      aria-label="ناوبری اصلی"
      dir="rtl"
      style={{
        transform: detailOpen ? 'translateY(10px) scale(0.96)' : 'none',
        transformOrigin: 'center bottom',
        transition: 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        const badgeCount = tab.badge && tab.badge > 0 ? tab.badge : 0;
        const badgeText = lang === 'fa' ? toPersianDigits(badgeCount) : String(badgeCount);

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={tab.label}
            onClick={() => {
              if (activeTab === tab.id) return;
              hapticTap();
              setActiveTab(tab.id);
            }}
            data-active={isActive}
            className="ios-tab-item"
          >
            <span className="relative flex items-center justify-center">
              <motion.span
                animate={
                  reduce
                    ? undefined
                    : { scale: isActive ? 1.06 : 1, y: isActive ? -0.5 : 0 }
                }
                transition={SPRING}
                className="flex items-center justify-center"
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.1 : 1.75} />
              </motion.span>

              {badgeCount > 0 && (
                <motion.span
                  key={badgeCount}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={SPRING}
                  className="ios-tab-badge tabular"
                  aria-label={`${badgeCount} مورد جدید`}
                >
                  {badgeText}
                </motion.span>
              )}
            </span>

            <span className="ios-tab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
