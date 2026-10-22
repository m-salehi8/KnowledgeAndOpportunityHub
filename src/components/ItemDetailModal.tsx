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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Item, JobStatus } from '../types';
import { useApp } from '../context/AppContext';
import { formatExactDate, normalizeTag } from '../utils/format';
import { JobScoreRing } from './JobScoreRing';
import { api } from '../api/client';

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

const Sheet: React.FC<SheetProps> = ({ item, onClose, onUpdate, onDelete }) => {
  const { lang, t, showToast } = useApp();
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isReenriching, setIsReenriching] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ y: number; t: number } | null>(null);
  const dragLast = useRef<{ y: number; t: number } | null>(null);

  const handleFavoriteToggle = async () => {
    try {
      const updated = await api.patchItem(item.id, { is_favorite: !item.is_favorite });
      onUpdate(updated);
      showToast(
        updated.is_favorite
          ? (lang === 'fa' ? 'به نشان‌شده‌ها افزوده شد' : 'Added to favorites')
          : (lang === 'fa' ? 'از نشان‌شده‌ها حذف شد' : 'Removed from favorites'),
        'success'
      );
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleArchiveToggle = async () => {
    try {
      const updated = await api.patchItem(item.id, { is_archived: !item.is_archived });
      onUpdate(updated);
      showToast(
        updated.is_archived
          ? (lang === 'fa' ? 'به آرشیو منتقل شد' : 'Archived')
          : (lang === 'fa' ? 'از آرشیو خارج شد' : 'Unarchived'),
        'info'
      );
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(lang === 'fa' ? 'آیا از حذف این مورد اطمینان دارید؟' : 'Are you sure you want to delete this item?')) {
      return;
    }
    try {
      await api.deleteItem(item.id);
      onDelete(item.id);
      onClose();
      showToast(lang === 'fa' ? 'مورد حذف شد' : 'Item deleted', 'info');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleReenrich = async () => {
    setIsReenriching(true);
    showToast(lang === 'fa' ? 'در حال بازتولید تحلیل و خلاصه هوش مصنوعی...' : 'Re-running AI enrichment...', 'info');
    try {
      const updated = await api.reenrichItem(item.id);
      onUpdate(updated);
      showToast(lang === 'fa' ? 'خلاصه با موفقیت به‌روزرسانی شد' : 'AI enrichment complete', 'success');
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
      showToast(
        lang === 'fa'
          ? `وضعیت به «${t[`status_${newStatus}` as keyof typeof t]}» تغییر یافت`
          : `Status updated to ${newStatus}`,
        'success'
      );
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
      showToast(lang === 'fa' ? 'لینک در کلیپ‌بورد کپی شد' : 'Link copied to clipboard', 'info');
    }
  };

  const formattedDate = formatExactDate(item.created_at, lang);

  const getSourceIcon = () => {
    switch (item.type) {
      case 'telegram':
        return <Send className="h-3.5 w-3.5 text-sky-300" />;
      case 'news':
        return <Newspaper className="h-3.5 w-3.5 text-emerald-300" />;
      case 'job':
        return <Compass className="h-3.5 w-3.5 text-indigo-300" />;
      case 'email':
        return <Mail className="h-3.5 w-3.5 text-amber-300" />;
      default:
        return <Sparkles className="h-3.5 w-3.5 text-cyan-300" />;
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

  const handleDragStart = (e: React.TouchEvent) => {
    dragStart.current = { y: e.touches[0].clientY, t: Date.now() };
    dragLast.current = { ...dragStart.current };
    setIsDragging(true);
  };

  const handleDragMove = (e: React.TouchEvent) => {
    if (!dragStart.current) return;
    const y = e.touches[0].clientY;
    dragLast.current = { y, t: Date.now() };
    setDragOffset(Math.max(0, y - dragStart.current.y));
  };

  const handleDragEnd = () => {
    const start = dragStart.current;
    const last = dragLast.current;
    const offset = start && last ? Math.max(0, last.y - start.y) : dragOffset;
    let velocity = 0;
    if (start && last && last.t > start.t) {
      velocity = (last.y - start.y) / (last.t - start.t);
    }
    setIsDragging(false);
    dragStart.current = null;
    if (offset > 110 || (offset > 40 && velocity > 0.55)) {
      onClose();
      return;
    }
    setDragOffset(0);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 320, mass: 0.9 }}
        className="relative flex w-full max-w-[430px] flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div
          className="ios-glass-sheet flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[38px] text-slate-900 dark:text-slate-100"
          style={{
            transform: `translateY(${dragOffset}px)`,
            transition: isDragging ? 'none' : 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
        <div
          className="shrink-0 touch-none"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onTouchCancel={handleDragEnd}
        >
          <div className="ios-grabber" />

          {/* Header */}
          <div className="flex shrink-0 items-center justify-between gap-2 px-5 pb-2">
          <div className="flex min-w-0 items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
            {getSourceIcon()}
            <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
              {item.source_name}
            </span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span className="shrink-0">{item.category}</span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={handleFavoriteToggle}
              className="ios-icon-button h-9 w-9"
              title={t.favorite}
            >
              <Star className={`h-4 w-4 ${item.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
            <button type="button" onClick={handleShare} className="ios-icon-button h-9 w-9" title={t.share}>
              <Share2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={onClose} className="ios-icon-button h-9 w-9" title="Close">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-4 pt-2">
          <div>
            <h2 dir="auto" className="text-[19px] font-bold leading-snug text-slate-900 dark:text-white">
              {item.title}
            </h2>
            <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">{formattedDate}</p>
          </div>

          {/* Job analysis */}
          {item.type === 'job' && item.job_meta && (
            <>
              <div className="relative overflow-hidden rounded-[24px] border border-emerald-300/25 bg-gradient-to-br from-emerald-400/[0.16] via-teal-400/[0.08] to-cyan-400/[0.06] p-4 backdrop-blur-xl">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -end-12 -top-12 h-32 w-32 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(16,185,129,0.35), transparent 70%)',
                    filter: 'blur(18px)',
                  }}
                />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-200">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>تحلیل هوش مصنوعی</span>
                    </div>
                    <h3 className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                      <Briefcase className="h-4 w-4 text-emerald-300" />
                      <span className="truncate">{item.job_meta.company}</span>
                    </h3>
                    <p dir="auto" className="mt-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                      {item.job_meta.match_reason}
                    </p>
                  </div>
                  <JobScoreRing score={item.job_meta.match_score} size={62} strokeWidth={4} />
                </div>
              </div>

              {/* Metadata row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="ios-glass-subtile min-w-0 p-2.5 text-center">
                  <Laptop className="mx-auto h-3.5 w-3.5 text-emerald-300" />
                  <div className="mt-1 truncate text-[9.5px] font-semibold text-slate-200">
                    {item.job_meta.remote ? 'دورکاری' : 'حضوری'}
                  </div>
                </div>
                <div className="ios-glass-subtile min-w-0 p-2.5 text-center">
                  <MapPin className="mx-auto h-3.5 w-3.5 text-cyan-300" />
                  <div dir="auto" className="mt-1 truncate text-[9.5px] font-semibold text-slate-200">
                    {item.job_meta.location}
                  </div>
                </div>
                <div className="ios-glass-subtile min-w-0 p-2.5 text-center">
                  <DollarSign className="mx-auto h-3.5 w-3.5 text-amber-300" />
                  <div dir="ltr" className="mt-1 truncate text-[9.5px] font-semibold text-slate-200">
                    {item.job_meta.salary_text || 'توافقی'}
                  </div>
                </div>
              </div>

              {/* Status selector */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400">
                    وضعیت درخواست
                  </span>
                  {item.job_meta.email_sent_to && (
                    <span className="flex items-center gap-1 text-[9px] font-medium text-emerald-300">
                      <Mail className="h-3 w-3" />
                      ایمیل شد
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {JobStatusMap.map((st) => {
                    const isCurrent = item.job_meta?.status === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleJobStatusChange(st)}
                        className={`ios-press rounded-full px-3 py-1.5 text-[10px] font-semibold transition-all ${
                          isCurrent
                            ? 'ios-glass-emerald'
                            : 'border border-white/10 bg-white/[0.055] text-slate-400 backdrop-blur-md'
                        }`}
                      >
                        {t[`status_${st}` as keyof typeof t]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Requirements */}
              {item.job_meta.requirements && item.job_meta.requirements.length > 0 && (
                <div>
                  <span className="mb-2 block text-[10.5px] font-semibold text-slate-500 dark:text-slate-400">
                    نیازمندی‌ها
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.job_meta.requirements.map((req, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-white/10 bg-white/[0.055] px-2.5 py-1 text-[9.5px] font-medium text-slate-300 backdrop-blur-md"
                      >
                        <bdi dir="ltr">{req}</bdi>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* AI summary */}
          <div className="ios-glass-card overflow-hidden p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                <span>خلاصه هوشمند Gemini</span>
              </div>
              <button
                type="button"
                onClick={handleReenrich}
                disabled={isReenriching}
                className="flex items-center gap-1 text-[9.5px] font-semibold text-cyan-300 disabled:opacity-50"
                title={t.reenrich}
              >
                <Sparkles className={`h-3 w-3 ${isReenriching ? 'animate-spin' : ''}`} />
                <span>{isReenriching ? 'در حال بازتولید...' : t.reenrich}</span>
              </button>
            </div>
            <p dir="auto" className="text-[11.5px] font-normal leading-relaxed text-slate-600 dark:text-slate-200">
              {item.summary}
            </p>
          </div>

          {/* Reader */}
          <div>
            <h3 className="mb-2 text-[9.5px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              {t.reader_mode}
            </h3>
            <div
              dir="auto"
              className="ios-reader whitespace-pre-line rounded-[22px] p-4 text-[11.5px] font-normal leading-relaxed text-slate-600 dark:text-slate-300"
            >
              {item.content || item.summary}
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400">
                برچسب‌ها
              </span>
              {!isAddingTag && (
                <button
                  type="button"
                  onClick={() => setIsAddingTag(true)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-cyan-300"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t.add_tag}</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.055] px-2.5 py-1 text-[10px] text-slate-300 backdrop-blur-md"
                >
                  <bdi dir="ltr">#{normalizeTag(tag)}</bdi>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ms-0.5 text-slate-500 transition-colors hover:text-rose-400"
                    title="Remove tag"
                  >
                    <X className="h-3 w-3" />
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
                    className="ios-field h-7 w-28 rounded-full px-2.5 text-[10px]"
                  />
                  <button
                    type="submit"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/25 text-[11px] text-cyan-100"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingTag(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[11px] text-slate-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Sticky action bar */}
        <div className="shrink-0 border-t border-white/[0.08] bg-slate-950/30 px-5 pb-safe pt-3 backdrop-blur-2xl dark:bg-slate-950/30">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleArchiveToggle}
              className="ios-icon-button h-11 w-11"
              title={item.is_archived ? t.unarchive : t.archive}
            >
              <Archive className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="ios-icon-button h-11 w-11 text-slate-500 hover:text-rose-400"
              title={t.delete}
            >
              <Trash2 className="h-4 w-4" />
            </button>

            {item.source_url ? (
              <a
                href={item.source_url}
                target="_blank"
                rel="noreferrer"
                className="ios-press flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-emerald-300/40 bg-gradient-to-r from-emerald-500/85 to-cyan-500/75 px-4 text-[11px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_26px_-10px_rgba(16,185,129,0.8)]"
              >
                <span className="truncate">{ctaLabel}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="ios-press h-11 flex-1 rounded-full border border-white/15 bg-white/10 text-[11px] font-semibold text-slate-100"
              >
                بستن
              </button>
            )}
          </div>
        </div>
        </div>
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
