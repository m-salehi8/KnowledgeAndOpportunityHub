// @ts-nocheck
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search as SearchIcon, X, Clock, SlidersHorizontal, Sparkles, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Item, ItemType } from '../../types';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { ItemRow } from '../ItemCard';
import { normalizeTag, toPersianDigits } from '../../utils/format';
import { BottomSheet, Chip, EmptyState, Pressable } from '../ui';

const RECENT_KEY = 'hub_recent_searches';

type DateFilter = 'any' | 'today' | 'week' | 'month';

const TYPE_OPTIONS: Array<{ id: ItemType | 'all'; label: string }> = [
  { id: 'all', label: 'همه' },
  { id: 'telegram', label: 'تلگرام' },
  { id: 'news', label: 'اخبار' },
  { id: 'job', label: 'شغلی' },
  { id: 'email', label: 'ایمیل' },
];

const DATE_OPTIONS: Array<{ id: DateFilter; label: string; days: number }> = [
  { id: 'any', label: 'همه زمان‌ها', days: 0 },
  { id: 'today', label: 'امروز', days: 1 },
  { id: 'week', label: 'یک هفته', days: 7 },
  { id: 'month', label: 'یک ماه', days: 30 },
];

const readRecent = (): string[] => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
};

export const SearchView: React.FC = () => {
  const { t, setSelectedItem, showToast } = useApp();
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ItemType | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('any');
  const [items, setItems] = useState<Item[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [recent, setRecent] = useState<string[]>(readRecent);
  const inputRef = useRef<HTMLInputElement>(null);

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
        type: selectedType !== 'all' ? selectedType : undefined,
      });
      setItems(res.items);
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }, [query, selectedTag, selectedCategory, selectedType, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      search();
    }, 220);
    return () => clearTimeout(timer);
  }, [search]);

  // remember recent searches
  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) return;
    const timer = setTimeout(() => {
      const next = [value, ...readRecent().filter((s) => s !== value)].slice(0, 6);
      setRecent(next);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [query]);

  const clearFilters = () => {
    setQuery('');
    setSelectedTag(null);
    setSelectedCategory(null);
    setSelectedType('all');
    setDateFilter('any');
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

  const hasActiveFilters = Boolean(
    query || selectedTag || selectedCategory || selectedType !== 'all' || dateFilter !== 'any'
  );

  const dateDays = DATE_OPTIONS.find((d) => d.id === dateFilter)?.days ?? 0;
  const visibleItems =
    dateDays > 0
      ? items.filter(
          (item) => Date.now() - new Date(item.created_at).getTime() <= dateDays * 86400000
        )
      : items;

  const showCancel = isFocused || query.length > 0;

  return (
    <div className="px-4">
      {/* iOS search bar */}
      <div className="ios-sticky-bar pb-2 pt-1">
        <div className="flex items-center gap-2">
          <div className="ios-searchbar flex-1">
            <SearchIcon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={t.search_placeholder}
              aria-label="جستجو"
              className="w-full bg-transparent text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--fill-tertiary)] text-[var(--text-secondary)]"
                aria-label="پاک کردن جستجو"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            )}
          </div>

          <AnimatePresence initial={false}>
            {showCancel && (
              <motion.button
                type="button"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => {
                  setIsFocused(false);
                  setQuery('');
                  inputRef.current?.blur();
                }}
                className="shrink-0 text-[15px] text-[var(--accent)]"
              >
                انصراف
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Recent searches */}
      {!query && recent.length > 0 && (
        <section className="mt-3">
          <div className="mb-1.5 flex items-center justify-between px-1">
            <span className="text-[12px] font-semibold text-[var(--text-secondary)]">
              جستجوهای اخیر
            </span>
            <button
              type="button"
              onClick={() => {
                setRecent([]);
                try {
                  localStorage.removeItem(RECENT_KEY);
                } catch {
                  // ignore
                }
              }}
              className="text-[12px] text-[var(--accent)]"
            >
              پاک کردن
            </button>
          </div>
          <div className="ios-list overflow-hidden">
            {recent.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="ios-list-row w-full"
              >
                <Clock className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" strokeWidth={1.75} />
                <span className="ios-row-title flex-1 truncate text-start">{term}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mt-4">
          <div className="mb-2 flex items-center gap-1.5 px-1 text-[12px] font-semibold text-[var(--text-secondary)]">
            <Folder className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span>دسته‌بندی‌های موضوعی</span>
          </div>
          <div className="no-scrollbar snap-x flex gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <Pressable
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className="snap-start shrink-0"
                aria-pressed={selectedCategory === cat}
              >
                <span className="ios-chip" data-active={selectedCategory === cat}>
                  {cat}
                </span>
              </Pressable>
            ))}
          </div>
        </section>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <section className="mt-4">
          <div className="mb-2 px-1 text-[12px] font-semibold text-[var(--text-secondary)]">
            برچسب‌های کلیدی
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Pressable
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                aria-pressed={selectedTag === tag}
              >
                <span className="ios-chip h-[26px] min-h-[26px] px-2.5 text-[11px]" data-active={selectedTag === tag}>
                  <bdi dir="ltr">#{normalizeTag(tag)}</bdi>
                </span>
              </Pressable>
            ))}
          </div>
        </section>
      )}

      {/* Filter bar */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-[12px] text-[var(--text-secondary)]">
          {toPersianDigits(visibleItems.length)} نتیجه
        </span>
        <Pressable
          onClick={() => setShowFilters(true)}
          className="ios-btn ios-btn-secondary h-9 min-h-9 px-3 text-[12px]"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>فیلتر</span>
          {hasActiveFilters && (
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
          )}
        </Pressable>
      </div>

      {/* Results */}
      <div className="mt-2">
        {loading && items.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="ios-skeleton h-[96px] rounded-[var(--r-card)]" />
            ))}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="ios-card">
            <EmptyState
              icon={<Sparkles className="h-7 w-7" strokeWidth={1.5} />}
              title="هیچ موردی یافت نشد"
              description="کلمات جستجو یا فیلتر انتخاب‌شده را تغییر دهید."
              action={
                <Pressable onClick={clearFilters} className="ios-btn ios-btn-secondary h-11 px-5 text-[15px]">
                  حذف فیلترها
                </Pressable>
              }
            />
          </div>
        ) : (
          <div className="ios-list overflow-hidden">
            {visibleItems.map((item, index) => (
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

      {/* Filter sheet */}
      <BottomSheet
        open={showFilters}
        onClose={() => setShowFilters(false)}
        ariaLabel="فیلترهای جستجو"
        detents={[
          { id: 'medium', ratio: 0.6 },
          { id: 'large', ratio: 0.9 },
        ]}
        header={
          <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-3">
            <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">فیلترها</h2>
            <Pressable
              onClick={clearFilters}
              className="text-[14px] font-medium text-[var(--accent)]"
            >
              بازنشانی
            </Pressable>
          </div>
        }
        footer={
          <Pressable
            onClick={() => setShowFilters(false)}
            className="ios-btn ios-btn-primary w-full text-[15px]"
          >
            اعمال فیلترها
          </Pressable>
        }
      >
        <div className="space-y-6 px-4 pb-6">
          <section>
            <h3 className="mb-2 text-[13px] font-semibold text-[var(--text-secondary)]">نوع محتوا</h3>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_OPTIONS.map((opt) => (
                <Chip
                  key={opt.id}
                  active={selectedType === opt.id}
                  onClick={() => setSelectedType(opt.id)}
                  className="h-[30px] min-h-[30px] px-3 text-[12px]"
                >
                  {opt.label}
                </Chip>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-[13px] font-semibold text-[var(--text-secondary)]">بازه زمانی</h3>
            <div className="flex flex-wrap gap-1.5">
              {DATE_OPTIONS.map((opt) => (
                <Chip
                  key={opt.id}
                  active={dateFilter === opt.id}
                  onClick={() => setDateFilter(opt.id)}
                  className="h-[30px] min-h-[30px] px-3 text-[12px]"
                >
                  {opt.label}
                </Chip>
              ))}
            </div>
          </section>

          {selectedCategory && (
            <section>
              <h3 className="mb-2 text-[13px] font-semibold text-[var(--text-secondary)]">
                دسته‌بندی انتخاب‌شده
              </h3>
              <Chip
                active
                onClick={() => setSelectedCategory(null)}
                className="h-[30px] min-h-[30px] px-3 text-[12px]"
              >
                {selectedCategory}
                <X className="h-3 w-3" strokeWidth={1.75} />
              </Chip>
            </section>
          )}
        </div>
      </BottomSheet>
    </div>
  );
};
