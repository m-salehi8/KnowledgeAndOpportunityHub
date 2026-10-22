import React, { useState, useEffect, useCallback } from 'react';
import {
  Send,
  Newspaper,
  Compass,
  Mail,
  Layers,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { Item, ItemType } from '../../types';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { ItemCard } from '../ItemCard';
import { PWAInstallBanner } from '../PWAInstallBanner';
import { toPersianDigits } from '../../utils/format';

export const InboxView: React.FC = () => {
  const { lang, t, setSelectedItem, reloadTrigger, showToast, stats } = useApp();
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<ItemType | 'all'>('all');

  const fetchItems = useCallback(async () => {
    try {
      const res = await api.getItems({ is_archived: false });
      setAllItems(res.items);
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    setLoading(true);
    fetchItems();
  }, [fetchItems, reloadTrigger]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const handleFavoriteToggle = async (item: Item) => {
    try {
      const updated = await api.patchItem(item.id, { is_favorite: !item.is_favorite });
      setAllItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      showToast(
        updated.is_favorite
          ? (lang === 'fa' ? 'به نشان‌شده‌ها افزوده شد' : 'Added to favorites')
          : (lang === 'fa' ? 'از نشان‌شده‌ها حذف شد' : 'Removed from favorites'),
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
      showToast(lang === 'fa' ? 'به آرشیو منتقل شد' : 'Archived', 'info');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const filterTabs: Array<{
    id: ItemType | 'all';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'all', label: t.type_all, icon: Layers },
    { id: 'telegram', label: t.type_telegram, icon: Send },
    { id: 'job', label: t.type_job, icon: Compass },
    { id: 'news', label: t.type_news, icon: Newspaper },
    { id: 'email', label: t.type_email, icon: Mail },
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
  const freshNewsCount = stats?.news_count ?? allItems.filter((item) => item.type === 'news').length;

  const topNews = allItems.find((item) => item.type === 'news');
  const topJob = allItems
    .filter((item) => item.type === 'job')
    .sort((a, b) => (b.job_meta?.match_score ?? 0) - (a.job_meta?.match_score ?? 0))[0];

  const today = new Intl.DateTimeFormat('fa-IR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div className="space-y-4 pb-4">
      <PWAInstallBanner />

      {/* Smart summary hero */}
      <section className="px-4">
        <div className="ios-glass-card ios-specular overflow-hidden p-[18px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -start-20 h-56 w-56 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(236,72,153,0.34), rgba(99,102,241,0.16) 55%, transparent 72%)',
              filter: 'blur(28px)',
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -end-16 h-48 w-48 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(34,211,238,0.24), transparent 70%)',
              filter: 'blur(30px)',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/40 bg-cyan-400/12 px-3 py-1 text-[10px] font-bold text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-md">
                <Sparkles className="h-3 w-3 text-cyan-200" />
                <span>خلاصه هوشمند امروز</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400">{today}</span>
            </div>

            <div className="mt-4 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="metric-number ios-glass-text text-[3.25rem] font-extrabold leading-none">
                  {toPersianDigits(unreadCount)}
                </div>
                <p className="mt-1 text-[11px] font-medium text-slate-400">مورد خوانده‌نشده</p>
              </div>

              <div className="grid w-[55%] max-w-[210px] grid-cols-2 gap-2">
                <div className="ios-glass-subtile p-2.5 text-center">
                  <div className="metric-number text-lg font-extrabold leading-none text-emerald-300">
                    {toPersianDigits(highMatchCount)}
                  </div>
                  <p className="mt-1 text-[9px] font-medium leading-snug text-slate-400">شغل پرتطابق</p>
                </div>
                <div className="ios-glass-subtile p-2.5 text-center">
                  <div className="metric-number text-lg font-extrabold leading-none text-amber-300">
                    {toPersianDigits(freshNewsCount)}
                  </div>
                  <p className="mt-1 text-[9px] font-medium leading-snug text-slate-400">خبر تازه</p>
                </div>
              </div>
            </div>

            {(topNews || topJob) && (
              <div className="mt-4 space-y-2">
                {topNews && (
                  <button
                    type="button"
                    onClick={() => setSelectedItem(topNews)}
                    className="ios-press flex w-full items-center gap-2.5 rounded-2xl border border-white/[0.07] bg-black/20 px-2.5 py-2 text-start backdrop-blur-md transition-colors hover:bg-black/25"
                  >
                    <span
                      aria-hidden="true"
                      className="h-8 w-[4px] shrink-0 rounded-full"
                      style={{
                        background: 'linear-gradient(180deg, #38BDF8, #818CF8)',
                        boxShadow: '0 0 10px rgba(56,189,248,0.6)',
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[9px] font-semibold text-cyan-200/80">خبر برگزیده</span>
                      <span dir="auto" className="line-clamp-1 text-[11px] font-medium text-slate-200">
                        {topNews.title}
                      </span>
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  </button>
                )}

                {topJob && (
                  <button
                    type="button"
                    onClick={() => setSelectedItem(topJob)}
                    className="ios-press flex w-full items-center gap-2.5 rounded-2xl border border-white/[0.07] bg-black/20 px-2.5 py-2 text-start backdrop-blur-md transition-colors hover:bg-black/25"
                  >
                    <span
                      aria-hidden="true"
                      className="h-8 w-[4px] shrink-0 rounded-full"
                      style={{
                        background: 'linear-gradient(180deg, #34D399, #22D3EE)',
                        boxShadow: '0 0 10px rgba(52,211,153,0.55)',
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[9px] font-semibold text-emerald-200/80">
                        فرصت پرتطابق
                      </span>
                      <span dir="auto" className="line-clamp-1 text-[11px] font-medium text-slate-200">
                        {topJob.title}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] font-bold text-emerald-300">
                      {toPersianDigits(topJob.job_meta?.match_score ?? 0)}٪
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Glass filter rail */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 pb-1 pt-0.5">
        {filterTabs.map((tab) => {
          const isActive = selectedType === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedType(tab.id)}
              className={`ios-press flex shrink-0 items-center gap-1.5 px-3 py-2 text-[11px] font-semibold transition-all duration-200 ${
                isActive ? 'ios-glass-pill-active' : 'ios-glass-pill text-slate-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/[0.07] text-slate-400'
                }`}
              >
                {toPersianDigits(countOf(tab.id))}
              </span>
            </button>
          );
        })}
      </div>

      {/* Count + refresh */}
      <div className="flex items-center justify-between px-4 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="font-medium">
          {toPersianDigits(items.length)} {lang === 'fa' ? 'مورد در صندوق' : 'items in inbox'}
        </span>
        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="ios-press flex items-center gap-1 font-semibold text-cyan-300 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? t.refreshing : t.refresh}</span>
        </button>
      </div>

      {/* Feed */}
      <div className="px-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="ios-glass-card ios-skeleton h-[152px] rounded-[26px]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="ios-glass-card ios-specular px-6 py-9 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-300">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.empty_feed_title}</h3>
            <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              {t.empty_feed_desc}
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onFavoriteToggle={handleFavoriteToggle}
                onArchiveToggle={handleArchiveToggle}
                onSelect={setSelectedItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
