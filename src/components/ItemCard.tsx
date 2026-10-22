import React, { useState } from 'react';
import {
  Send,
  Newspaper,
  Compass,
  Mail,
  Star,
  Archive,
  Check,
  ChevronLeft,
} from 'lucide-react';
import { motion, useAnimation, PanInfo } from 'motion/react';
import { Item, ItemType } from '../types';
import { useApp } from '../context/AppContext';
import { formatRelativeTime, normalizeTag } from '../utils/format';
import { JobScoreRing } from './JobScoreRing';

interface ItemCardProps {
  item: Item;
  onFavoriteToggle?: (item: Item) => void;
  onArchiveToggle?: (item: Item) => void;
  onSelect?: (item: Item) => void;
}

const SOURCE_STYLES: Record<
  ItemType,
  { wrap: string; icon: React.ComponentType<{ className?: string }>; badge: string }
> = {
  telegram: {
    wrap: 'bg-sky-400/15 text-sky-300 border-sky-300/25',
    icon: Send,
    badge: 'bg-sky-400/12 text-sky-200 border-sky-300/20',
  },
  news: {
    wrap: 'bg-emerald-400/15 text-emerald-300 border-emerald-300/25',
    icon: Newspaper,
    badge: 'bg-amber-400/12 text-amber-200 border-amber-300/20',
  },
  job: {
    wrap: 'bg-indigo-400/15 text-indigo-300 border-indigo-300/25',
    icon: Compass,
    badge: 'bg-emerald-400/12 text-emerald-200 border-emerald-300/20',
  },
  email: {
    wrap: 'bg-amber-400/15 text-amber-300 border-amber-300/25',
    icon: Mail,
    badge: 'bg-amber-400/12 text-amber-200 border-amber-300/20',
  },
  producthunt: {
    wrap: 'bg-orange-400/15 text-orange-300 border-orange-300/25',
    icon: Compass,
    badge: 'bg-orange-400/12 text-orange-200 border-orange-300/20',
  },
};

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onFavoriteToggle,
  onArchiveToggle,
  onSelect,
}) => {
  const { lang, t } = useApp();
  const controls = useAnimation();
  const [swipeAction, setSwipeAction] = useState<'favorite' | 'archive' | null>(null);

  const sourceStyle = SOURCE_STYLES[item.type] ?? SOURCE_STYLES.news;
  const SourceIcon = sourceStyle.icon;

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
    } else if (info.offset.x < -threshold) {
      if (onArchiveToggle) onArchiveToggle(item);
    }
    await controls.start({ x: 0, transition: { type: 'spring', damping: 26, stiffness: 320 } });
    setSwipeAction(null);
  };

  const relativeDate = formatRelativeTime(item.created_at, lang);

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteToggle) onFavoriteToggle(item);
  };

  return (
    <div className="relative mb-3 overflow-hidden rounded-[26px] select-none">
      {/* Swipe action field */}
      <div className="absolute inset-0 flex items-center justify-between overflow-hidden rounded-[26px] px-5">
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all duration-200 ${
            swipeAction === 'favorite'
              ? 'bg-amber-400/25 text-amber-100 shadow-[0_0_24px_-4px_rgba(251,191,36,0.6)]'
              : 'text-amber-200/35'
          }`}
        >
          <Star className="h-4 w-4 fill-current" />
          <span>{item.is_favorite ? t.unfavorite : t.favorite}</span>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all duration-200 ${
            swipeAction === 'archive'
              ? 'bg-rose-500/25 text-rose-100 shadow-[0_0_24px_-4px_rgba(244,63,94,0.6)]'
              : 'text-rose-200/35'
          }`}
        >
          <span>{item.is_archived ? t.unarchive : t.archive}</span>
          <Archive className="h-4 w-4" />
        </div>
      </div>

      {/* Glass card */}
      <motion.article
        drag="x"
        dragConstraints={{ left: -112, right: 112 }}
        dragElastic={0.35}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        onClick={() => onSelect && onSelect(item)}
        className={`ios-glass-card ios-specular relative z-10 cursor-pointer p-[18px] transition-transform duration-200 active:scale-[0.985] ${
          item.is_read ? 'opacity-[0.86]' : ''
        }`}
        style={{ borderRadius: 26 }}
      >
        {/* Unread edge light */}
        {!item.is_read && (
          <span
            aria-hidden="true"
            className="absolute inset-y-6 start-0 w-[3px] rounded-full"
            style={{
              background: 'linear-gradient(180deg, #67E8F9, #6366F1)',
              boxShadow: '0 0 14px rgba(103,232,249,0.55)',
            }}
          />
        )}

        {/* Meta row */}
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {!item.is_read && (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_8px_#22D3EE]" />
            )}

            <span
              className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[9px] border backdrop-blur-md ${sourceStyle.wrap}`}
            >
              <SourceIcon className="h-3 w-3" />
            </span>

            <span
              dir="auto"
              className={`max-w-[128px] truncate rounded-full border px-2 py-[3px] text-[10px] font-bold backdrop-blur-md ${sourceStyle.badge}`}
            >
              {item.source_name}
            </span>

            <span aria-hidden="true" className="text-[10px] text-slate-500/60">
              ·
            </span>
            <span className="whitespace-nowrap text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {relativeDate}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {item.is_read && <Check className="h-3.5 w-3.5 text-slate-500" />}
            <button
              type="button"
              onClick={handleStarClick}
              className="ios-press flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] text-slate-400 backdrop-blur-md transition-colors hover:text-amber-300"
              title={item.is_favorite ? t.unfavorite : t.favorite}
              aria-label={item.is_favorite ? t.unfavorite : t.favorite}
            >
              <Star
                className={`h-4 w-4 ${
                  item.is_favorite
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-400/80 dark:text-slate-500'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Title + score */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <h2
            dir="auto"
            className="line-clamp-2 flex-1 text-[14px] font-bold leading-[1.55] text-slate-900 dark:text-slate-50"
          >
            {item.title}
          </h2>

          {item.type === 'job' && item.job_meta && (
            <div className="shrink-0 -mt-0.5">
              <JobScoreRing score={item.job_meta.match_score} size={44} strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Summary */}
        <p
          dir="auto"
          className="mb-3 line-clamp-2 text-[11.5px] font-normal leading-relaxed text-slate-600 dark:text-slate-300/85"
        >
          {item.summary}
        </p>

        {/* Job chips */}
        {item.type === 'job' && item.job_meta && (
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            {item.source_name.includes('jobinja') && (
              <span className="rounded-full border border-blue-300/25 bg-blue-400/12 px-2 py-[3px] text-[9.5px] font-bold text-blue-200 backdrop-blur-md">
                جابینجا
              </span>
            )}
            {item.source_name.includes('jobvision') && (
              <span className="rounded-full border border-teal-300/25 bg-teal-400/12 px-2 py-[3px] text-[9.5px] font-bold text-teal-200 backdrop-blur-md">
                جاب‌ویژن
              </span>
            )}
            {item.job_meta.remote && (
              <span className="rounded-full border border-emerald-300/25 bg-emerald-400/12 px-2 py-[3px] text-[9.5px] font-bold text-emerald-200 backdrop-blur-md">
                دورکاری
              </span>
            )}
            {item.job_meta.requirements?.slice(0, 3).map((req, idx) => (
              <span
                key={idx}
                className="rounded-full border border-white/10 bg-white/[0.055] px-2 py-[3px] text-[9.5px] font-medium text-slate-300 backdrop-blur-md"
              >
                <bdi dir="ltr">{req}</bdi>
              </span>
            ))}
            {item.job_meta.email_sent_to && (
              <span className="ms-auto flex items-center gap-1 rounded-full border border-amber-300/25 bg-amber-400/12 px-2 py-[3px] text-[9.5px] font-bold text-amber-200">
                <Mail className="h-2.5 w-2.5" />
                ایمیل شد
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-white/[0.07] pt-2.5">
          {item.type === 'job' && item.job_meta ? (
            <div className="flex min-w-0 items-center gap-1.5 text-[10.5px]">
              <span className="max-w-[120px] shrink-0 truncate font-bold text-cyan-200 dark:text-cyan-300">
                <bdi dir="ltr">{item.job_meta.company}</bdi>
              </span>
              <span aria-hidden="true" className="text-slate-500/50">
                ·
              </span>
              <span className="truncate text-slate-500 dark:text-slate-400">
                <bdi dir="ltr">{item.job_meta.location}</bdi>
              </span>
            </div>
          ) : (
            <div className="flex min-w-0 items-center gap-1.5 text-[10.5px]">
              <span className="truncate font-semibold text-cyan-200/90 dark:text-cyan-300">{item.category}</span>
              {item.tags.length > 0 && (
                <>
                  <span aria-hidden="true" className="text-slate-500/50">
                    ·
                  </span>
                  <span className="truncate text-slate-500 dark:text-slate-400">
                    <bdi dir="ltr">#{normalizeTag(item.tags[0])}</bdi>
                  </span>
                </>
              )}
            </div>
          )}

          <div className="flex shrink-0 items-center gap-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
            <span>{t.reader_mode}</span>
            <ChevronLeft className="h-3 w-3 opacity-70" />
          </div>
        </div>
      </motion.article>
    </div>
  );
};
