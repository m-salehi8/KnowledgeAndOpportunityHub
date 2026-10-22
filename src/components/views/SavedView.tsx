import React, { useState, useEffect, useCallback } from 'react';
import { Star, Archive, Bookmark } from 'lucide-react';
import { Item } from '../../types';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { ItemCard } from '../ItemCard';
import { toPersianDigits } from '../../utils/format';

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
    <div className="space-y-4 pb-4">
      {/* Segmented glass switcher */}
      <div className="px-4">
        <div className="ios-glass-pill flex items-center gap-1 p-1">
          <button
            type="button"
            onClick={() => setActiveSegment('favorites')}
            className={`ios-press flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-[10.5px] font-bold transition-all ${
              activeSegment === 'favorites'
                ? 'bg-amber-400/20 text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_14px_-6px_rgba(251,191,36,0.55)]'
                : 'text-slate-400'
            }`}
          >
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>نشان‌شده‌ها</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSegment('archive')}
            className={`ios-press flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-[10.5px] font-bold transition-all ${
              activeSegment === 'archive'
                ? 'bg-white/80 text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_14px_-6px_rgba(15,23,42,0.18)] dark:bg-white/15 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]'
                : 'text-slate-400'
            }`}
          >
            <Archive className="h-3.5 w-3.5" />
            <span>بایگانی</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 text-[10px] text-slate-500 dark:text-slate-400">
        <span>{toPersianDigits(items.length)} مورد</span>
        <span className="text-amber-300/80">{activeSegment === 'favorites' ? 'علاقه‌مندی‌ها' : 'آرشیو'}</span>
      </div>

      <div className="px-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="ios-glass-card ios-skeleton h-[140px] rounded-[26px]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="ios-glass-card ios-specular px-6 py-9 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-400/10 text-amber-300">
              <Bookmark className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.empty_saved_title}</h3>
            <p className="mx-auto mt-1 max-w-xs text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400">
              {t.empty_saved_desc}
            </p>
          </div>
        ) : (
          items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onFavoriteToggle={handleFavoriteToggle}
              onArchiveToggle={handleArchiveToggle}
              onSelect={setSelectedItem}
            />
          ))
        )}
      </div>
    </div>
  );
};
