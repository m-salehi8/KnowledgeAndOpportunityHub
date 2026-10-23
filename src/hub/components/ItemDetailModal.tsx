// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Check,
  ExternalLink,
  Share2,
  Star,
  Archive,
  Trash2,
  Sparkles,
  Plus,
  Send,
  Newspaper,
  Compass,
  Mail,
  MapPin,
  DollarSign,
  Briefcase,
  Laptop,
  Rocket,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence, useAnimation, useReducedMotion } from 'motion/react';
import { Item, JobStatus } from '../types';
import { useApp } from '../context/AppContext';
import { formatExactDate, normalizeTag } from '../utils/format';
import { JobScoreRing } from './JobScoreRing';
import { api } from '../api/client';
import { hapticImpact, hapticTap } from '../utils/haptics';

interface ItemDetailModalProps {
  item: Item | null;
  onClose: () => void;
  onUpdate: (updated: Item) => void;
  onDelete: (id: string) => void;
}

interface SheetProps {
  item: Item;
  onClose: () => void;
  onUpdate: (updated: Item) => void;
  onDelete: (id: string) => void;
}

const JobStatusMap: JobStatus[] = ['new', 'saved', 'applied', 'interview', 'rejected'];

const DETENTS = {
  medium: 0.62,
  large: 0.94,
} as const;

type Detent = keyof typeof DETENTS;

const Sheet: React.FC<SheetProps> = ({ item, onClose, onUpdate, onDelete }) => {
  const { lang, t, showToast } = useApp();
  const reduce = useReducedMotion();
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isReenriching, setIsReenriching] = useState(false);
  const [detent, setDetent] = useState<Detent>('medium');
  const sheetControls = useAnimation();

  const handleFavoriteToggle = async () => {
    try {
      const updated = await api.patchItem(item.id, { is_favorite: !item.is_favorite });
      onUpdate(updated);
      showToast(updated.is_favorite ? 'به ذخیره‌شده‌ها افزوده شد' : 'از ذخیره‌شده‌ها حذف شد', 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleArchiveToggle = async () => {
    try {
      const updated = await api.patchItem(item.id, { is_archived: !item.is_archived });
      onUpdate(updated);
      showToast(updated.is_archived ? 'به بایگانی منتقل شد' : 'از بایگانی خارج شد', 'info');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(lang === 'fa' ? 'آیا از حذف این مورد اطمینان دارید؟' : 'Delete this item?')) {
      return;
    }
    try {
      hapticImpact();
      await api.deleteItem(item.id);
      onDelete(item.id);
      onClose();
      showToast('مورد حذف شد', 'info');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleReenrich = async () => {
    setIsReenriching(true);
    showToast('در حال بازتولید تحلیل و خلاصه هوش مصنوعی...', 'info');
    try {
      const updated = await api.reenrichItem(item.id);
      onUpdate(updated);
      showToast('خلاصه با موفقیت به‌روزرسانی شد', 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setIsReenriching(false);
    }
  };

  const handleJobStatusChange = async (newStatus: JobStatus) => {
    try {
      const updated = await api.patchJobStatus(item.id, newStatus);
      onUpdate(updated);
      showToast(`وضعیت به «${t[`status_${newStatus}` as keyof typeof t]}» تغییر یافت`, 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const tag = normalizeTag(newTagInput);
    if (!tag) return;
    if (item.tags.includes(tag)) {
      setNewTagInput('');
      setIsAddingTag(false);
      return;
    }
    try {
      const updated = await api.patchItem(item.id, { tags: [...item.tags, tag] });
      onUpdate(updated);
      setNewTagInput('');
      setIsAddingTag(false);
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    try {
      const updated = await api.patchItem(item.id, {
        tags: item.tags.filter((tag) => tag !== tagToRemove),
      });
      onUpdate(updated);
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleShare = async () => {
    hapticTap();
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.summary,
          url: item.source_url || window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else if (item.source_url) {
      await navigator.clipboard.writeText(item.source_url);
      showToast('لینک در کلیپ‌بورد کپی شد', 'info');
    }
  };

  const formattedDate = formatExactDate(item.created_at, lang);

  const sourceIcon = () => {
    switch (item.type) {
      case 'telegram':
        return <Send className="h-4 w-4" strokeWidth={1.75} />;
      case 'news':
        return <Newspaper className="h-4 w-4" strokeWidth={1.75} />;
      case 'job':
        return <Compass className="h-4 w-4" strokeWidth={1.75} />;
      case 'email':
        return <Mail className="h-4 w-4" strokeWidth={1.75} />;
      case 'producthunt':
        return <Rocket className="h-4 w-4" strokeWidth={1.75} />;
      default:
        return <Sparkles className="h-4 w-4" strokeWidth={1.75} />;
    }
  };

  const sourceUrl = item.source_url || '';
  const isAggregatedJobLink =
    /jobinja\.ir\/jobs\?|jobvision\.ir\/jobs\?|remoteok\.com\/remote-|weworkremotely\.com\/categories\//.test(
      sourceUrl
    );
  const ctaLabel = sourceUrl.includes('jobinja')
    ? isAggregatedJobLink
      ? 'جستجوی آگهی‌های مشابه در جابینجا'
      : 'مشاهده آگهی در جابینجا'
    : sourceUrl.includes('jobvision')
      ? isAggregatedJobLink
        ? 'جستجوی آگهی‌های مشابه در جاب‌ویژن'
        : 'مشاهده آگهی در جاب‌ویژن'
      : isAggregatedJobLink
        ? 'مشاهده آگهی‌های مشابه'
        : t.open_source;

  /* --- drag to dismiss / expand --- */
  const dragStart = useRef<number | null>(null);
  const dragDelta = useRef(0);

  const handlePointerDown = (event: React.PointerEvent) => {
    dragStart.current = event.clientY;
    dragDelta.current = 0;
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const delta = Math.max(0, event.clientY - dragStart.current);
    dragDelta.current = delta;
    sheetControls.set({ y: delta });
  };

  const handlePointerUp = () => {
    const delta = dragDelta.current;
    dragStart.current = null;
    dragDelta.current = 0;
    if (delta > 110) {
      onClose();
      return;
    }
    sheetControls.start({ y: 0, transition: { type: 'spring', stiffness: 380, damping: 34 } });
  };

  const ratio = DETENTS[detent];

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center" dir="rtl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={reduce ? { duration: 0.01 } : { type: 'spring', stiffness: 380, damping: 34 }}
        className="relative flex w-full max-w-[430px] flex-col"
        style={{
          height: `${ratio * 100}dvh`,
          transitionProperty: 'height',
          transitionDuration: '0.32s',
          transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <motion.div
          animate={sheetControls}
          className="flex h-full w-full flex-col overflow-hidden rounded-t-[24px] ios-sheet"
        >
        {/* Sticky header */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="shrink-0 touch-none px-4 pb-2 pt-1"
        >
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setDetent((d) => (d === 'medium' ? 'large' : 'medium'))}
              className="flex h-6 w-24 items-center justify-center"
              aria-label={detent === 'medium' ? 'بزرگ‌کردن' : 'کوچک‌کردن'}
            >
              <span className="ios-sheet-handle !m-0" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 py-1.5">
            <div className="flex min-w-0 items-center gap-2 text-[12px] text-[var(--text-secondary)]">
              <span className="shrink-0 text-[var(--accent)]">{sourceIcon()}</span>
              <span dir="auto" className="truncate font-semibold text-[var(--text-primary)]">
                {item.source_name}
              </span>
              <span aria-hidden="true" className="opacity-40">
                ·
              </span>
              <span className="shrink-0">{item.category}</span>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleFavoriteToggle}
                className="ios-icon-button h-9 w-9"
                aria-label={item.is_favorite ? t.unfavorite : t.favorite}
              >
                <Star
                  className={`h-[18px] w-[18px] ${item.is_favorite ? 'fill-[var(--warning)] text-[var(--warning)]' : ''}`}
                  strokeWidth={1.75}
                />
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="ios-icon-button h-9 w-9"
                aria-label={t.share}
              >
                <Share2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="ios-icon-button h-9 w-9"
                aria-label="بستن"
              >
                <X className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <h2 dir="auto" className="text-[20px] font-bold leading-[1.6] text-[var(--text-primary)]">
            {item.title}
          </h2>
          <p className="mt-1 text-[11px] text-[var(--text-tertiary)]">{formattedDate}</p>

          {/* Job block */}
          {item.type === 'job' && item.job_meta && (
            <section className="ios-card mt-4 p-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--success)]">
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
                    تحلیل هوش مصنوعی
                  </span>
                  <h3 className="mt-1.5 flex items-center gap-1.5 text-[15px] font-semibold text-[var(--text-primary)]">
                    <Briefcase className="h-4 w-4 text-[var(--success)]" strokeWidth={1.75} />
                    <span dir="auto" className="truncate">
                      {item.job_meta.company}
                    </span>
                  </h3>
                </div>
                <JobScoreRing score={item.job_meta.match_score} size={58} strokeWidth={4.5} />
              </div>

              <p
                dir="auto"
                className="mt-3 text-[13px] leading-[1.7] text-[var(--text-secondary)]"
              >
                {item.job_meta.match_reason}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="ios-chip h-[26px] min-h-[26px] px-2.5 text-[11px]">
                  {item.job_meta.remote ? (
                    <>
                      <Laptop className="h-3 w-3" strokeWidth={1.75} />
                      دورکاری
                    </>
                  ) : (
                    <>
                      <MapPin className="h-3 w-3" strokeWidth={1.75} />
                      حضوری
                    </>
                  )}
                </span>
                <span className="ios-chip h-[26px] min-h-[26px] px-2.5 text-[11px]">
                  <MapPin className="h-3 w-3" strokeWidth={1.75} />
                  <bdi dir="ltr">{item.job_meta.location}</bdi>
                </span>
                <span className="ios-chip h-[26px] min-h-[26px] px-2.5 text-[11px]" data-tone="warning">
                  <DollarSign className="h-3 w-3" strokeWidth={1.75} />
                  <bdi dir="ltr">{item.job_meta.salary_text || 'توافقی'}</bdi>
                </span>
              </div>
            </section>
          )}

          {/* AI summary — visually distinct card */}
          <section
            className="mt-4 rounded-[var(--r-card)] p-4"
            style={{ background: 'var(--accent-soft)', border: '0.5px solid var(--accent-separator)' }}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--accent)]">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
                خلاصه هوشمند
              </span>
              <button
                type="button"
                onClick={handleReenrich}
                disabled={isReenriching}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)] disabled:opacity-50"
                aria-label={t.reenrich}
              >
                <Sparkles
                  className={`h-3 w-3 ${isReenriching ? 'animate-spin' : ''}`}
                  strokeWidth={1.75}
                />
                <span>{isReenriching ? 'در حال بازتولید...' : t.reenrich}</span>
              </button>
            </div>
            <p dir="auto" className="text-[14px] leading-[1.8] text-[var(--text-primary)]">
              {item.summary}
            </p>
          </section>

          {/* Job status */}
          {item.type === 'job' && item.job_meta && (
            <section className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-[var(--text-secondary)]">
                  وضعیت درخواست
                </h3>
                {item.job_meta.email_sent_to && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-[var(--success)]">
                    <Mail className="h-3 w-3" strokeWidth={1.75} />
                    ایمیل شد
                  </span>
                )}
              </div>
              <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
                {JobStatusMap.map((st) => {
                  const isCurrent = item.job_meta?.status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleJobStatusChange(st)}
                      className="ios-chip h-[32px] min-h-[32px] shrink-0 px-3 text-[12px]"
                      data-active={isCurrent}
                      aria-pressed={isCurrent}
                    >
                      {t[`status_${st}` as keyof typeof t]}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Requirements */}
          {item.type === 'job' && item.job_meta?.requirements?.length ? (
            <section className="mt-5">
              <h3 className="mb-2 text-[13px] font-semibold text-[var(--text-secondary)]">
                نیازمندی‌ها
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {item.job_meta.requirements.map((req, i) => (
                  <span key={i} className="ios-chip h-[26px] min-h-[26px] px-2.5 text-[11px]">
                    <bdi dir="ltr">{req}</bdi>
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {/* Reader */}
          <section className="mt-5">
            <h3 className="mb-2 text-[13px] font-semibold text-[var(--text-secondary)]">
              {t.reader_mode}
            </h3>
            <div
              dir="auto"
              className="ios-readable rounded-[var(--r-card)] bg-[var(--fill-quaternary)] p-4"
            >
              {item.content || item.summary}
            </div>
          </section>

          {/* Tags */}
          <section className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-[var(--text-secondary)]">برچسب‌ها</h3>
              {!isAddingTag && (
                <button
                  type="button"
                  onClick={() => setIsAddingTag(true)}
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--accent)]"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span>{t.add_tag}</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {item.tags.map((tag) => (
                <span key={tag} className="ios-chip h-[28px] min-h-[28px] px-2.5 text-[11px]">
                  <bdi dir="ltr">#{normalizeTag(tag)}</bdi>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ms-0.5 text-[var(--text-tertiary)]"
                    aria-label={`حذف برچسب ${normalizeTag(tag)}`}
                  >
                    <X className="h-3 w-3" strokeWidth={1.75} />
                  </button>
                </span>
              ))}

              {isAddingTag && (
                <form onSubmit={handleAddTag} className="flex items-center gap-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder="نام برچسب..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    className="ios-field h-9 w-32 text-[13px]"
                  />
                  <button
                    type="submit"
                    className="ios-icon-button h-9 w-9 bg-[var(--accent-soft)] text-[var(--accent)]"
                    aria-label="افزودن برچسب"
                  >
                    <Check className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingTag(false)}
                    className="ios-icon-button h-9 w-9"
                    aria-label="انصراف"
                  >
                    <X className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>

        {/* Sticky action bar */}
        <div className="shrink-0 border-t-0.5px border-[var(--glass-border)] px-4 pb-safe pt-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleArchiveToggle}
              className="ios-icon-button h-11 w-11 shrink-0"
              aria-label={item.is_archived ? t.unarchive : t.archive}
            >
              <Archive className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="ios-icon-button h-11 w-11 shrink-0 text-[var(--danger)]"
              aria-label={t.delete}
            >
              <Trash2 className="h-5 w-5" strokeWidth={1.75} />
            </button>

            {item.source_url ? (
              <a
                href={item.source_url}
                target="_blank"
                rel="noreferrer"
                className="ios-btn ios-btn-primary h-11 flex-1 text-[14px]"
              >
                <span className="truncate">{ctaLabel}</span>
                <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              </a>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="ios-btn ios-btn-secondary h-11 flex-1 text-[14px]"
              >
                بستن
              </button>
            )}
          </div>
        </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [displayItem, setDisplayItem] = useState<Item | null>(item);

  useEffect(() => {
    if (item) setDisplayItem(item);
  }, [item]);

  return (
    <AnimatePresence>
      {item && displayItem && (
        <Sheet
          key={displayItem.id}
          item={displayItem}
          onClose={onClose}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      )}
    </AnimatePresence>
  );
};
