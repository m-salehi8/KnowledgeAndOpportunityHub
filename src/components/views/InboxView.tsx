import React, { useState, useEffect, useCallback } from 'react';
import { Send, Newspaper, Compass, Mail, Layers, RefreshCw } from 'lucide-react';
import { Item, ItemType } from '../../types';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { ItemCard } from '../ItemCard';
import { PWAInstallBanner } from '../PWAInstallBanner';

export const InboxView: React.FC = () => {
  const { lang, t, setSelectedItem, reloadTrigger, showToast } = useApp();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<ItemType | 'all'>('all');

  const fetchItems = useCallback(async () => {
    try {
      const res = await api.getItems({
        type: selectedType === 'all' ? undefined : selectedType,
        is_archived: false,
      });
      setItems(res.items);
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedType, showToast]);

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
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
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
      const updated = await api.patchItem(item.id, { is_archived: !item.is_archived });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      showToast(lang === 'fa' ? 'به آرشیو منتقل شد' : 'Archived', 'info');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const filterTabs: Array<{ id: ItemType | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'all', label: t.type_all, icon: Layers },
    { id: 'telegram', label: t.type_telegram, icon: Send },
    { id: 'job', label: t.type_job, icon: Compass },
    { id: 'news', label: t.type_news, icon: Newspaper },
    { id: 'email', label: t.type_email, icon: Mail },
  ];

  return (
    <div className="space-y-3 pb-24">
      {/* PWA banner if not installed on iOS */}
      <PWAInstallBanner />

      {/* Segmented Filter Tabs */}
      <div className="px-4">
        <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-[#151520] rounded-2xl overflow-x-auto no-scrollbar border border-slate-300/60 dark:border-white/5">
          {filterTabs.map((tab) => {
            const isActive = selectedType === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all active:scale-95 ${
                  isActive
                    ? 'bg-white dark:bg-gradient-to-r dark:from-indigo-600 dark:to-violet-600 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subheader info & pull/refresh status */}
      <div className="px-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="font-medium">
          {items.length} {lang === 'fa' ? 'مورد در صندوق' : 'items in inbox'}
        </span>
        <button
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold active:scale-95"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? t.refreshing : t.refresh}</span>
        </button>
      </div>

      {/* Item Cards List */}
      <div className="px-4">
        {loading ? (
          // Skeleton loaders
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="p-4 rounded-2xl bg-white dark:bg-[#14141E] border border-slate-200 dark:border-white/5 animate-pulse space-y-2.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="h-3 w-28 bg-slate-200 dark:bg-white/10 rounded" />
                  <div className="h-3 w-12 bg-slate-200 dark:bg-white/10 rounded" />
                </div>
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-white/10 rounded" />
                <div className="h-3 w-full bg-slate-100 dark:bg-white/5 rounded" />
                <div className="h-3 w-5/6 bg-slate-100 dark:bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#14141E] border border-slate-200 dark:border-white/5 space-y-2 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.empty_feed_title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              {t.empty_feed_desc}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
