// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import {
  Send,
  Newspaper,
  Compass,
  Mail,
  Layers,
  RefreshCw,
  Sparkles,
  Inbox,
  TriangleAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Item, ItemType } from '../../types';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { ItemRow } from '../ItemCard';
import { PWAInstallBanner } from '../PWAInstallBanner';
import { toPersianDigits } from '../../utils/format';
import { usePullToRefresh } from '../../utils/usePullToRefresh';
import { EmptyState, Pressable, ProgressRing, SegmentedControl } from '../ui';
import { ProductHuntView } from './ProductHuntView';
import { ProjectsView } from './ProjectsView';

type InboxSection = 'feed' | 'projects' | 'producthunt';

const SECTION_ITEMS: Array<{ id: InboxSection; label: string }> = [
  { id: 'feed', label: 'خبرها' },
  { id: 'projects', label: 'پروژه‌ها' },
  { id: 'producthunt', label: 'پروداکت' },
];

export const InboxView: React.FC = () => {
  const {
    t,
    setSelectedItem,
    reloadTrigger,
    showToast,
    stats,
    inboxSection,
    setInboxSection,
  } = useApp();

  const [allItems, setAllItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ItemType | 'all'>('all');

  const fetchItems = useCallback(async () => {
    try {
      const res = await api.getItems({ is_archived: false });
      setAllItems(res.items);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      showToast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    setLoading(true);
    fetchItems();
  }, [fetchItems, reloadTrigger]);

  const handleRefresh = useCallback(async () => {
    await fetchItems();
  }, [fetchItems]);

  const { pullDistance, isRefreshing } = usePullToRefresh({ onRefresh: handleRefresh });

  const handleFavoriteToggle = async (item: Item) => {
    try {
      const updated = await api.patchItem(item.id, { is_favorite: !item.is_favorite });
      setAllItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      showToast(
        updated.is_favorite ? 'به ذخیره‌شده‌ها افزوده شد' : 'از ذخیره‌شده‌ها حذف شد',
        'success'
      );
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleArchiveToggle = async (item: Item) => {
    try {
      await api.patchItem(item.id, { is_archived: !item.is_archived });
      setAllItems((prev) => prev.filter((i) => i.id !== item.id));
      showToast('به بایگانی منتقل شد', 'info');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const filterTabs: Array<{
    id: ItemType | 'all';
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  }> = [
    { id: 'all', label: 'همه', icon: Layers },
    { id: 'telegram', label: 'تلگرام', icon: Send },
    { id: 'job', label: 'فرصت شغلی', icon: Compass },
    { id: 'news', label: 'اخبار', icon: Newspaper },
    { id: 'email', label: 'ایمیل', icon: Mail },
  ];

  const countOf = (id: ItemType | 'all') =>
    id === 'all' ? allItems.length : allItems.filter((item) => item.type === id).length;

  const items =
    selectedType === 'all' ? allItems : allItems.filter((item) => item.type === selectedType);

  const unreadCount =
    stats?.unread_count ?? allItems.filter((item) => !item.is_read).length;
  const highMatchCount =
    stats?.high_match_jobs ??
    allItems.filter((item) => item.type === 'job' && (item.job_meta?.match_score ?? 0) >= 80).length;
  const readCount = allItems.filter((item) => item.is_read).length;
  const readProgress = allItems.length ? Math.round((readCount / allItems.length) * 100) : 0;

  const today = new Intl.DateTimeFormat('fa-IR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div className="px-4">
      {/* Sections: feed / projects / product hunt */}
      <div className="mb-4">
        <SegmentedControl
          items={SECTION_ITEMS}
          value={inboxSection as InboxSection}
          onChange={(value) => setInboxSection(value)}
          ariaLabel="بخش‌های صندوق ورودی"
        />
      </div>

      {inboxSection === 'projects' ? (
        <ProjectsView embedded />
      ) : inboxSection === 'producthunt' ? (
        <ProductHuntView embedded />
      ) : (
        <>
          <PWAInstallBanner />

          {/* Pull-to-refresh indicator */}
          <AnimatePresence>
            {pullDistance > 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none flex h-10 items-center justify-center"
              >
                <motion.span
                  animate={{ rotate: isRefreshing ? 360 : pullDistance * 3.6 }}
                  transition={
                    isRefreshing
                      ? { repeat: Infinity, ease: 'linear', duration: 0.9 }
                      : { type: 'spring', stiffness: 380, damping: 32 }
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--fill-quaternary)] text-[var(--text-secondary)]"
                >
                  <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Daily summary — single lightweight card */}
          <motion.section
            animate={{ y: pullDistance ? pullDistance * 0.35 : 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="ios-card p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-primary)]">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.75} />
                خلاصه امروز
              </span>
              <span className="text-[11px] text-[var(--text-tertiary)]">{today}</span>
            </div>

            <div className="flex items-center gap-4">
              <ProgressRing value={readProgress} size={58} strokeWidth={5} />

              <div className="grid flex-1 grid-cols-2 gap-3">
                <div>
                  <p className="text-[22px] font-bold leading-none text-[var(--text-primary)] tabular">
                    {toPersianDigits(unreadCount)}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-[var(--text-secondary)]">
                    خوانده‌نشده
                  </p>
                </div>
                <div>
                  <p className="text-[22px] font-bold leading-none text-[var(--success)] tabular">
                    {toPersianDigits(highMatchCount)}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-[var(--text-secondary)]">
                    شغل پرتطابق
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Type filters — horizontally scrolling chips with snap */}
          <div className="no-scrollbar snap-x mt-4 flex items-center gap-2 overflow-x-auto pb-1">
            {filterTabs.map((tab) => {
              const isActive = selectedType === tab.id;
              const Icon = tab.icon;
              return (
                <Pressable
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id)}
                  className="snap-start shrink-0"
                  aria-pressed={isActive}
                >
                  <span
                    className="ios-chip"
                    data-active={isActive}
                    data-tone={isActive ? undefined : 'neutral'}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                    <span>{tab.label}</span>
                    <span className="tabular text-[11px] opacity-70">
                      {toPersianDigits(countOf(tab.id))}
                    </span>
                  </span>
                </Pressable>
              );
            })}
          </div>

          {/* Grouped list */}
          <div className="mt-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="ios-skeleton h-[96px] rounded-[var(--r-card)]" />
                ))}
              </div>
            ) : error && items.length === 0 ? (
              <div className="ios-card">
                <EmptyState
                  icon={<TriangleAlert className="h-7 w-7" strokeWidth={1.5} />}
                  title="دریافت اطلاعات ممکن نشد"
                  description={error}
                  action={
                    <Pressable
                      onClick={handleRefresh}
                      className="ios-btn ios-btn-primary h-11 px-5 text-[15px]"
                    >
                      <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
                      <span>تلاش دوباره</span>
                    </Pressable>
                  }
                />
              </div>
            ) : items.length === 0 ? (
              <div className="ios-card">
                <EmptyState
                  icon={<Inbox className="h-7 w-7" strokeWidth={1.5} />}
                  title={t.empty_feed_title}
                  description={t.empty_feed_desc}
                  action={
                    <Pressable
                      onClick={handleRefresh}
                      className="ios-btn ios-btn-primary h-11 px-5 text-[15px]"
                    >
                      <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
                      <span>دریافت تازه‌ترین موارد</span>
                    </Pressable>
                  }
                />
              </div>
            ) : (
              <>
                <div className="ios-list overflow-hidden">
                  {items.map((item, index) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      index={index}
                      onFavoriteToggle={handleFavoriteToggle}
                      onArchiveToggle={handleArchiveToggle}
                      onSelect={setSelectedItem}
                    />
                  ))}
                </div>

                <p className="mt-3 text-center text-[11px] text-[var(--text-tertiary)]">
                  {toPersianDigits(items.length)} مورد · برای ذخیره سطر را به راست بکشید
                </p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
