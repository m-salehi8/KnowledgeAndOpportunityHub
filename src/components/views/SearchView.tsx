import React, { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, X, Tag as TagIcon, Folder, Sparkles } from 'lucide-react';
import { Item } from '../../types';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { ItemCard } from '../ItemCard';
import { normalizeTag, toPersianDigits } from '../../utils/format';

export const SearchView: React.FC = () => {
  const { lang, t, setSelectedItem, showToast } = useApp();
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [loadedTags, loadedCats] = await Promise.all([api.getTags(), api.getCategories()]);
        setTags(loadedTags);
        setCategories(loadedCats);
      } catch (err) {
        console.warn(err);
      }
    };
    loadMetadata();
  }, []);

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getItems({
        q: query.trim() || undefined,
        tag: selectedTag || undefined,
        category: selectedCategory || undefined,
      });
      setItems(res.items);
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }, [query, selectedTag, selectedCategory, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      search();
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const clearFilters = () => {
    setQuery('');
    setSelectedTag(null);
    setSelectedCategory(null);
  };

  const handleFavoriteToggle = async (item: Item) => {
    try {
      const updated = await api.patchItem(item.id, { is_favorite: !item.is_favorite });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleArchiveToggle = async (item: Item) => {
    try {
      const updated = await api.patchItem(item.id, { is_archived: !item.is_archived });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const hasActiveFilters = Boolean(query || selectedTag || selectedCategory);

  return (
    <div className="space-y-4 pb-4">
      {/* Search bar */}
      <div className="px-4">
        <div className="relative">
          <SearchIcon className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-300/80" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search_placeholder}
            className="ios-field h-12 w-full rounded-full ps-10 pe-10 text-[12px]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 px-4 text-[10px]">
          <span className="font-medium text-slate-500 dark:text-slate-400">فیلترهای فعال:</span>
          {selectedCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="ios-glass-pill inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-cyan-200"
            >
              <span>{selectedCategory}</span>
              <X className="h-3 w-3" />
            </button>
          )}
          {selectedTag && (
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className="ios-glass-pill inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-violet-200"
            >
              <span>#{normalizeTag(selectedTag)}</span>
              <X className="h-3 w-3" />
            </button>
          )}
          <button
            type="button"
            onClick={clearFilters}
            className="text-[10px] text-slate-500 underline underline-offset-2 dark:text-slate-400"
          >
            حذف همه
          </button>
        </div>
      )}

      {/* Categories */}
      <div className="px-4">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          <Folder className="h-3.5 w-3.5 text-cyan-300" />
          <span>دسته‌بندی‌های موضوعی</span>
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-0.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? null : cat)}
                className={`ios-press shrink-0 px-3 py-1.5 text-[10.5px] font-semibold transition-all ${
                  isSelected ? 'ios-glass-pill-active' : 'ios-glass-pill text-slate-300'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      <div className="px-4">
        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
          <TagIcon className="h-3.5 w-3.5 text-violet-300" />
          <span>برچسب‌های کلیدی استخراج‌شده</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(isSelected ? null : tag)}
                className={`ios-press rounded-full px-2.5 py-1 text-[9.5px] font-medium transition-all ${
                  isSelected
                    ? 'border border-violet-300/50 bg-violet-400/25 text-violet-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]'
                    : 'border border-white/[0.08] bg-white/[0.04] text-slate-400 backdrop-blur-md hover:text-slate-200'
                }`}
              >
                <bdi dir="ltr">#{normalizeTag(tag)}</bdi>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      <div className="px-4 pt-1">
        <div className="mb-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
          <span>{toPersianDigits(items.length)} نتیجه یافت شد</span>
          {loading && <span className="text-cyan-300">در حال جستجو...</span>}
        </div>

        {loading && items.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="ios-glass-card ios-skeleton h-[140px] rounded-[26px]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="ios-glass-card ios-specular px-6 py-9 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-cyan-300/50" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">هیچ موردی یافت نشد</h3>
            <p className="mt-1 text-[10.5px] text-slate-500 dark:text-slate-400">
              کلمات جستجو یا برچسب انتخاب‌شده را تغییر دهید.
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
