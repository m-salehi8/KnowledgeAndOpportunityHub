import React, { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, X, Tag as TagIcon, Folder, Sparkles } from 'lucide-react';
import { Item } from '../../types';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { ItemCard } from '../ItemCard';

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
        const [loadedTags, loadedCats] = await Promise.all([
          api.getTags(),
          api.getCategories(),
        ]);
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
    <div className="space-y-4 pb-24 px-4">
      {/* Search Input Bar */}
      <div className="relative">
        <SearchIcon className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.search_placeholder}
          className="w-full h-11 ps-10 pe-10 bg-white dark:bg-[#151520] border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {lang === 'fa' ? 'فیلترهای فعال:' : 'Active filters:'}
          </span>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[11px] border border-indigo-200 dark:border-indigo-500/30 font-medium"
            >
              <span>{selectedCategory}</span>
              <X className="w-3 h-3" />
            </button>
          )}
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 text-[11px] border border-purple-200 dark:border-purple-500/30 font-medium"
            >
              <span>#{selectedTag}</span>
              <X className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={clearFilters}
            className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline underline-offset-2"
          >
            {lang === 'fa' ? 'حذف همه' : 'Clear all'}
          </button>
        </div>
      )}

      {/* Category Chips */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2 font-semibold">
          <Folder className="w-3.5 h-3.5 text-indigo-500" />
          <span>{lang === 'fa' ? 'دسته‌بندی‌های موضوعی' : 'Categories'}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isSelected ? null : cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-[#151520] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:text-white border border-slate-200/80 dark:border-white/5 shadow-sm'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tag Cloud */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2 font-semibold">
          <TagIcon className="w-3.5 h-3.5 text-violet-500" />
          <span>{lang === 'fa' ? 'برچسب‌های کلیدی استخراج‌شده با هوش مصنوعی' : 'AI-Extracted Tag Cloud'}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(isSelected ? null : tag)}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-violet-600 text-white shadow-sm font-bold'
                    : 'bg-slate-200/70 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:text-slate-200 border border-slate-200 dark:border-white/5'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Results */}
      <div className="pt-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
          <span>
            {items.length} {lang === 'fa' ? 'نتیجه یافت شد' : 'results found'}
          </span>
        </div>

        {loading ? (
          <div className="p-6 text-center text-xs text-slate-400">
            {lang === 'fa' ? 'در حال جستجو...' : 'Searching...'}
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#14141E] border border-slate-200 dark:border-white/5 space-y-2 shadow-sm">
            <Sparkles className="w-8 h-8 text-indigo-500/40 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'fa' ? 'هیچ موردی مطابق این فیلترها یافت نشد' : 'No items match your query'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lang === 'fa' ? 'کلمات جستجو یا برچسب انتخاب‌شده را تغییر دهید.' : 'Try adjusting your keywords or tag filters.'}
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
