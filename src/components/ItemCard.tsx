import React, { useState } from 'react';
import { Send, Newspaper, Compass, Mail, Star, Archive, ChevronRight, Check } from 'lucide-react';
import { motion, useAnimation, PanInfo } from 'motion/react';
import { Item } from '../types';
import { useApp } from '../context/AppContext';
import { formatRelativeTime } from '../utils/format';
import { JobScoreRing } from './JobScoreRing';

interface ItemCardProps {
  item: Item;
  onFavoriteToggle?: (item: Item) => void;
  onArchiveToggle?: (item: Item) => void;
  onSelect?: (item: Item) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onFavoriteToggle,
  onArchiveToggle,
  onSelect,
}) => {
  const { lang, t } = useApp();
  const controls = useAnimation();
  const [swipeAction, setSwipeAction] = useState<'favorite' | 'archive' | null>(null);

  const getSourceIcon = () => {
    switch (item.type) {
      case 'telegram':
        return (
          <div className="w-5 h-5 rounded-md bg-sky-500/10 text-sky-500 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Send className="w-3 h-3" />
          </div>
        );
      case 'news':
        return (
          <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Newspaper className="w-3 h-3" />
          </div>
        );
      case 'job':
        return (
          <div className="w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Compass className="w-3 h-3" />
          </div>
        );
      case 'email':
        return (
          <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Mail className="w-3 h-3" />
          </div>
        );
    }
  };

  const handleDrag = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 50) {
      setSwipeAction('favorite');
    } else if (info.offset.x < -50) {
      setSwipeAction('archive');
    } else {
      setSwipeAction(null);
    }
  };

  const handleDragEnd = async (_: unknown, info: PanInfo) => {
    const threshold = 85;
    if (info.offset.x > threshold) {
      if (onFavoriteToggle) onFavoriteToggle(item);
      await controls.start({ x: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } });
    } else if (info.offset.x < -threshold) {
      if (onArchiveToggle) onArchiveToggle(item);
      await controls.start({ x: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } });
    } else {
      await controls.start({ x: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } });
    }
    setSwipeAction(null);
  };

  const relativeDate = formatRelativeTime(item.created_at, lang);

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteToggle) onFavoriteToggle(item);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl mb-3 select-none">
      {/* Background swipe indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-6 rounded-2xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-white/5">
        <div
          className={`flex items-center gap-2 text-xs font-semibold transition-opacity duration-200 ${
            swipeAction === 'favorite' ? 'opacity-100 text-amber-500' : 'opacity-30 text-slate-400 dark:text-slate-600'
          }`}
        >
          <Star className="w-5 h-5 fill-current" />
          <span>{item.is_favorite ? t.unfavorite : t.favorite}</span>
        </div>
        <div
          className={`flex items-center gap-2 text-xs font-semibold transition-opacity duration-200 ${
            swipeAction === 'archive' ? 'opacity-100 text-rose-500' : 'opacity-30 text-slate-400 dark:text-slate-600'
          }`}
        >
          <span>{item.is_archived ? t.unarchive : t.archive}</span>
          <Archive className="w-5 h-5" />
        </div>
      </div>

      {/* Main card surface */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -110, right: 110 }}
        dragElastic={0.4}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        onClick={() => onSelect && onSelect(item)}
        className={`relative z-10 p-4 rounded-2xl cursor-pointer transition-all duration-150 active:scale-[0.99] ${
          item.is_read
            ? 'bg-slate-50/90 dark:bg-[#12121A]/95 border border-slate-200/70 dark:border-white/5'
            : 'bg-white dark:bg-[#181824] border border-slate-200/90 dark:border-indigo-500/20 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-sm'
        }`}
      >
        {/* Top unboxed metadata line */}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
          <div className="flex items-center gap-1.5 truncate">
            {getSourceIcon()}
            <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[150px]">
              {item.source_name}
            </span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span className="text-[11px] whitespace-nowrap text-slate-400 dark:text-slate-500">{relativeDate}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {item.is_read && (
              <span title={t.mark_as_read} className="inline-flex">
                <Check className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              </span>
            )}
            <button
              onClick={handleStarClick}
              className="p-1 -me-1 rounded-lg text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
              title={item.is_favorite ? t.unfavorite : t.favorite}
              aria-label={item.is_favorite ? t.unfavorite : t.favorite}
            >
              <Star
                className={`w-4 h-4 ${
                  item.is_favorite
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Title & match score layout */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2
            dir="auto"
            className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2"
          >
            {item.title}
          </h2>

          {item.type === 'job' && item.job_meta && (
            <div className="shrink-0 -mt-0.5">
              <JobScoreRing score={item.job_meta.match_score} size={42} strokeWidth={3} />
            </div>
          )}
        </div>

        {/* AI Summary */}
        <p
          dir="auto"
          className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-2.5 font-normal"
        >
          {item.summary}
        </p>

        {/* Job Requirements & Source Badges */}
        {item.type === 'job' && item.job_meta && (
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {item.source_name.includes('jobinja') ? (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                جابینجا
              </span>
            ) : item.source_name.includes('jobvision') ? (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                جاب‌ویژن
              </span>
            ) : null}

            {item.job_meta.remote && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                دورکاری
              </span>
            )}

            {item.job_meta.requirements?.slice(0, 3).map((req, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/5"
              >
                {req}
              </span>
            ))}

            {item.job_meta.email_sent_to && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 ms-auto flex items-center gap-1">
                <Mail className="w-2.5 h-2.5" />
                <span>ایمیل شد</span>
              </span>
            )}
          </div>
        )}

        {/* Bottom clean metadata & job specifics */}
        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-white/5">
          {item.type === 'job' && item.job_meta ? (
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="font-semibold text-indigo-600 dark:text-indigo-300 shrink-0 max-w-[120px] truncate">
                {item.job_meta.company}
              </span>
              <span aria-hidden="true" className="opacity-40">·</span>
              <span className="truncate max-w-[140px] text-slate-500 dark:text-slate-400">
                {item.job_meta.location}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="text-indigo-600 dark:text-indigo-400 font-medium truncate">
                {item.category}
              </span>
              {item.tags.length > 0 && (
                <>
                  <span aria-hidden="true" className="opacity-40">·</span>
                  <span className="text-slate-400 dark:text-slate-500 truncate">#{item.tags[0]}</span>
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 shrink-0 text-[10px] hover:text-indigo-500 transition-colors">
            <span>{t.reader_mode}</span>
            <ChevronRight className="w-3 h-3 rtl:rotate-180 opacity-70" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
