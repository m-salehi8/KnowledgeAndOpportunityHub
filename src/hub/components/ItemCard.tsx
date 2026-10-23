// @ts-nocheck
import React, { useState } from 'react';
import {
  Send,
  Newspaper,
  Compass,
  Mail,
  Star,
  Archive,
  ChevronLeft,
  Rocket,
} from 'lucide-react';
import { motion, useAnimation, PanInfo, useReducedMotion } from 'motion/react';
import { Item, ItemType } from '../types';
import { useApp } from '../context/AppContext';
import { formatRelativeTime } from '../utils/format';
import { hapticTap, hapticImpact } from '../utils/haptics';
import { JobScoreRing } from './JobScoreRing';

interface ItemHandlers {
  onFavoriteToggle?: (item: Item) => void;
  onArchiveToggle?: (item: Item) => void;
  onSelect?: (item: Item) => void;
  /** Opens the job status menu (jobs only). */
  onStatusChange?: (item: Item) => void;
}

interface ItemRowProps extends ItemHandlers {
  item: Item;
  index?: number;
}

interface ItemCardProps extends ItemHandlers {
  item: Item;
}

const SOURCE_META: Record<
  ItemType,
  { icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }
> = {
  telegram: { icon: Send },
  news: { icon: Newspaper },
  job: { icon: Compass },
  email: { icon: Mail },
  producthunt: { icon: Rocket },
};

/* One neutral material for every source badge — no per-type colours. */
const BADGE_STYLE = {
  background: 'var(--fill-tertiary)',
  color: 'var(--text-secondary)',
} as const;

/* Neutral chip used for every metadata label. */
const CHIP = 'ios-chip h-[28px] min-h-[28px] px-3 text-[11px]';

/* ------------------------------------------------------------------ */
/* Grouped row — used by Inbox / Saved / Search lists                  */
/* ------------------------------------------------------------------ */
export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  index,
  onFavoriteToggle,
  onArchiveToggle,
  onSelect,
}) => {
  const { lang } = useApp();
  const controls = useAnimation();
  const reduce = useReducedMotion();
  const [swipe, setSwipe] = useState<'favorite' | 'archive' | null>(null);
  const [dragging, setDragging] = useState(false);

  const meta = SOURCE_META[item.type] ?? SOURCE_META.news;
  const SourceIcon = meta.icon;
  const relative = formatRelativeTime(item.created_at, lang);

  const handleDrag = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 44) setSwipe('favorite');
    else if (info.offset.x < -44) setSwipe('archive');
    else setSwipe(null);
  };

  const handleDragEnd = async (_: unknown, info: PanInfo) => {
    const threshold = 88;
    if (info.offset.x > threshold && onFavoriteToggle) {
      hapticImpact();
      onFavoriteToggle(item);
    } else if (info.offset.x < -threshold && onArchiveToggle) {
      hapticImpact();
      onArchiveToggle(item);
    }
    await controls.start({ x: 0, transition: { type: 'spring', stiffness: 380, damping: 32 } });
    setSwipe(null);
    setDragging(false);
  };

  return (
    <motion.div
      className="ios-swipe-row"
      data-dragging={dragging}
      initial={reduce ? undefined : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.22,
        delay: reduce ? 0 : Math.min(index ?? 0, 8) * 0.03,
        ease: [0.32, 0.72, 0, 1],
      }}
    >
      {/* Swipe action field */}
      <div className="ios-swipe-bg">
        <span
          className="ios-swipe-action"
          style={{
            color: 'var(--accent)',
            opacity: swipe === 'favorite' ? 1 : 0.35,
            transform: swipe === 'favorite' ? 'scale(1)' : 'scale(0.94)',
          }}
        >
          <Star className="h-[18px] w-[18px]" strokeWidth={1.75} />
          <span>{item.is_favorite ? 'حذف نشان' : 'ذخیره'}</span>
        </span>

        <span
          className="ios-swipe-action"
          style={{
            color: 'var(--text-secondary)',
            opacity: swipe === 'archive' ? 1 : 0.35,
            transform: swipe === 'archive' ? 'scale(1)' : 'scale(0.94)',
          }}
        >
          <span>{item.is_archived ? 'خروج از آرشیو' : 'بایگانی'}</span>
          <Archive className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -110, right: 110 }}
        dragElastic={0.12}
        onDragStart={() => setDragging(true)}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative"
      >
        <button
          type="button"
          onClick={() => {
            hapticTap();
            onSelect?.(item);
          }}
          className="flex w-full items-start gap-3.5 py-3.5 pe-4 ps-[22px] text-start"
        >
          {!item.is_read && (
            <span
              className="ios-unread-dot absolute start-[7px] top-[17px]"
              aria-label="خوانده‌نشده"
            />
          )}

          <span
            className="mt-0.5 inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px]"
            style={BADGE_STYLE}
            aria-hidden="true"
          >
            <SourceIcon className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </span>

          <span className="min-w-0 flex-1">
            <span
              dir="auto"
              className="line-clamp-2 block text-[15px] font-semibold leading-[1.55] text-[var(--text-primary)]"
            >
              {item.title}
            </span>

            <span
              dir="auto"
              className="line-clamp-2 mt-1.5 block text-[13px] font-normal leading-[1.7] text-[var(--text-secondary)]"
            >
              {item.summary}
            </span>

            <span className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
              <span dir="auto" className="max-w-[140px] truncate font-medium">
                {item.source_name}
              </span>
              <span aria-hidden="true">·</span>
              <span className="whitespace-nowrap">{relative}</span>
              {item.type === 'job' && item.job_meta?.remote && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-[var(--text-secondary)]">دورکاری</span>
                </>
              )}
            </span>
          </span>

          {item.type === 'job' && item.job_meta ? (
            <JobScoreRing score={item.job_meta.match_score} size={40} strokeWidth={3.5} />
          ) : (
            <ChevronLeft
              className="mt-2 h-4 w-4 shrink-0 text-[var(--text-quaternary)]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          )}
        </button>
      </motion.div>
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Rich card — used by the Jobs list                                   */
/* ------------------------------------------------------------------ */
export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onFavoriteToggle,
  onArchiveToggle,
  onSelect,
  onStatusChange,
}) => {
  const { lang, t } = useApp();
  const controls = useAnimation();
  const reduce = useReducedMotion();
  const [swipe, setSwipe] = useState<'favorite' | 'archive' | null>(null);
  const [dragging, setDragging] = useState(false);

  const meta = SOURCE_META[item.type] ?? SOURCE_META.news;
  const SourceIcon = meta.icon;
  const relative = formatRelativeTime(item.created_at, lang);

  const handleDrag = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 44) setSwipe('favorite');
    else if (info.offset.x < -44) setSwipe('archive');
    else setSwipe(null);
  };

  const handleDragEnd = async (_: unknown, info: PanInfo) => {
    const threshold = 88;
    if (info.offset.x > threshold && onFavoriteToggle) {
      hapticImpact();
      onFavoriteToggle(item);
    } else if (info.offset.x < -threshold && onArchiveToggle) {
      hapticImpact();
      onArchiveToggle(item);
    }
    await controls.start({ x: 0, transition: { type: 'spring', stiffness: 380, damping: 32 } });
    setSwipe(null);
    setDragging(false);
  };

  return (
    <div
      className="ios-swipe-row ios-card mb-4 overflow-hidden"
      data-dragging={dragging}
    >
      <div className="ios-swipe-bg">
        <span
          className="ios-swipe-action"
          style={{
            color: 'var(--accent)',
            opacity: swipe === 'favorite' ? 1 : 0.35,
          }}
        >
          <Star className="h-[18px] w-[18px]" strokeWidth={1.75} />
          <span>{item.is_favorite ? t.unfavorite : t.favorite}</span>
        </span>
        <span
          className="ios-swipe-action"
          style={{
            color: 'var(--text-secondary)',
            opacity: swipe === 'archive' ? 1 : 0.35,
          }}
        >
          <span>{item.is_archived ? t.unarchive : t.archive}</span>
          <Archive className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -110, right: 110 }}
        dragElastic={0.12}
        onDragStart={() => setDragging(true)}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative"
      >
        <article
          onClick={() => {
            hapticTap();
            onSelect?.(item);
          }}
          className="p-5"
          style={{ opacity: item.is_read ? 0.82 : 1 }}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px]"
                style={BADGE_STYLE}
                aria-hidden="true"
              >
                <SourceIcon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span dir="auto" className="max-w-[150px] truncate text-[12px] font-semibold text-[var(--text-primary)]">
                {item.source_name}
              </span>
              <span aria-hidden="true" className="text-[var(--text-quaternary)]">
                ·
              </span>
              <span className="whitespace-nowrap text-[11px] text-[var(--text-secondary)]">
                {relative}
              </span>
            </div>

            {item.type === 'job' && item.job_meta && (
              <JobScoreRing score={item.job_meta.match_score} size={46} strokeWidth={4} />
            )}
          </div>

          <h2
            dir="auto"
            className="line-clamp-2 text-[16px] font-semibold leading-[1.6] text-[var(--text-primary)]"
          >
            {item.title}
          </h2>

          <p
            dir="auto"
            className="mt-2.5 line-clamp-2 text-[13px] leading-[1.7] text-[var(--text-secondary)]"
          >
            {item.summary}
          </p>

          {item.type === 'job' && item.job_meta && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {item.job_meta.company && (
                <span className={CHIP}>
                  <bdi dir="ltr">{item.job_meta.company}</bdi>
                </span>
              )}
              {item.job_meta.location && (
                <span className={CHIP}>
                  <bdi dir="ltr">{item.job_meta.location}</bdi>
                </span>
              )}
              {item.job_meta.remote && <span className={CHIP}>دورکاری</span>}
              {item.job_meta.salary_text && (
                <span className={CHIP}>
                  <bdi dir="ltr">{item.job_meta.salary_text}</bdi>
                </span>
              )}
              {onStatusChange && item.job_meta && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    hapticTap();
                    onStatusChange(item);
                  }}
                  className={CHIP}
                  data-tone="accent"
                  aria-label="تغییر وضعیت درخواست"
                >
                  <span>{t[`status_${item.job_meta.status}` as keyof typeof t]}</span>
                </button>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-2 border-t-[0.5px] border-[var(--separator)] pt-3.5">
            <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
              <span className="truncate font-medium text-[var(--text-secondary)]">{item.category}</span>
            </span>

            <span className="flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-[var(--text-tertiary)]">
              {t.reader_mode}
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            </span>
          </div>
        </article>
      </motion.div>
    </div>
  );
};
