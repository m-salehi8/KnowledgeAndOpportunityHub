// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { Star, Archive, Bookmark, RefreshCw, TriangleAlert } from 'lucide-react';
import { Item } from '../../types';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { ItemRow } from '../ItemCard';
import { toPersianDigits } from '../../utils/format';
import { EmptyState, Pressable, SegmentedControl } from '../ui';

export const SavedView: React.FC = () => {
  const { t, setSelectedItem, reloadTrigger, showToast } = useApp();
  const [activeSegment, setActiveSegment] = useState<'favorites' | 'archive'>('favorites');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await api.getItems({
        is_favorite: activeSegment === 'favorites' ? true : undefined,
        is_archived: activeSegment === 'archive' ? true : false,
      });
      setItems(res.items);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
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
    <div className="px-4">
      <SegmentedControl
        items={[
          { id: 'favorites', label: 'نشان‌شده‌ها', icon: Star },
          { id: 'archive', label: 'بایگانی', icon: Archive },
        ]}
        value={activeSegment}
        onChange={(value) => setActiveSegment(value as 'favorites' | 'archive')}
        ariaLabel="بخش‌های ذخیره‌شده‌ها"
      />

      <div className="mt-4 flex items-center justify-between px-1 text-[12px] text-[var(--text-secondary)]">
        <span>{toPersianDigits(items.length)} مورد</span>
        <span>{activeSegment === 'favorites' ? 'علاقه‌مندی‌ها' : 'بایگانی'}</span>
      </div>

      <div className="mt-2">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
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
                  onClick={fetchItems}
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
              icon={<Bookmark className="h-7 w-7" strokeWidth={1.5} />}
              title={t.empty_saved_title}
              description={t.empty_saved_desc}
            />
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};
