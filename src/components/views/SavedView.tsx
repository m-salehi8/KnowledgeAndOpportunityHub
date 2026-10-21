import React, { useState, useEffect, useCallback } from 'react';
import { Star, Archive, Bookmark } from 'lucide-react';
import { Item } from '../../types';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { ItemCard } from '../ItemCard';

export const SavedView: React.FC = () => {
  const { lang, t, setSelectedItem, reloadTrigger, showToast } = useApp();
  const [activeSegment, setActiveSegment] = useState<'favorites' | 'archive'>('favorites');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      const res = await api.getItems({
        is_favorite: activeSegment === 'favorites' ? true : undefined,
        is_archived: activeSegment === 'archive' ? true : false,
      });
      setItems(res.items);
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }, [activeSegment, showToast]);

  useEffect(() => {
    setLoading(true);
    fetchItems();
  }, [fetchItems, reloadTrigger]);

  const handleFavoriteToggle = async (item: Item) => {
    try {
      const updated = await api.patchItem(item.id, { is_favorite: !item.is_favorite });
      if (activeSegment === 'favorites' && !updated.is_favorite) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      } else {
        setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      }
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleArchiveToggle = async (item: Item) => {
    try {
      const updated = await api.patchItem(item.id, { is_archived: !item.is_archived });
      if (activeSegment === 'archive' && !updated.is_archived) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      } else {
        setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      }
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  return (
    <div className="space-y-4 pb-24 px-4">
      {/* Segment Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-[#151520] rounded-2xl border border-slate-300/60 dark:border-white/5">
        <button
          onClick={() => setActiveSegment('favorites')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all active:scale-98 ${
            activeSegment === 'favorites'
              ? 'bg-white dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{lang === 'fa' ? 'نشان‌شده‌ها (علاقه‌مندی‌ها)' : 'Favorites'}</span>
        </button>

        <button
          onClick={() => setActiveSegment('archive')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all active:scale-98 ${
            activeSegment === 'archive'
              ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white border border-slate-300 dark:border-white/10 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>{lang === 'fa' ? 'بایگانی (آرشیو)' : 'Archived'}</span>
        </button>
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          {items.length} {lang === 'fa' ? 'مورد ذخیره شده' : 'items'}
        </span>
      </div>

      {/* Items List */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="p-4 rounded-2xl bg-white dark:bg-[#14141E] border border-slate-200 dark:border-white/5 animate-pulse h-28 shadow-sm"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#14141E] border border-slate-200 dark:border-white/5 space-y-2 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.empty_saved_title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              {t.empty_saved_desc}
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
