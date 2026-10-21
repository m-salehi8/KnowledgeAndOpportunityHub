import React, { useState } from 'react';
import {
  X,
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
import { formatExactDate } from '../utils/format';
import { JobScoreRing } from './JobScoreRing';
import { api } from '../api/client';

interface ItemDetailModalProps {
  item: Item | null;
  onClose: () => void;
  onUpdate: (updated: Item) => void;
  onDelete: (id: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const { lang, t, showToast } = useApp();
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isReenriching, setIsReenriching] = useState(false);

  if (!item) return null;

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
      showToast(lang === 'fa' ? `وضعیت به «${t[`status_${newStatus}` as keyof typeof t]}» تغییر یافت` : `Status updated to ${newStatus}`, 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagInput.trim().replace(/^#/, '');
    if (!tag) return;

    if (item.tags.includes(tag)) {
      setNewTagInput('');
      setIsAddingTag(false);
      return;
    }

    try {
      const updatedTags = [...item.tags, tag];
      const updated = await api.patchItem(item.id, { tags: updatedTags });
      onUpdate(updated);
      setNewTagInput('');
      setIsAddingTag(false);
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    try {
      const updatedTags = item.tags.filter((t) => t !== tagToRemove);
      const updated = await api.patchItem(item.id, { tags: updatedTags });
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
        return <Send className="w-4 h-4 text-sky-500 dark:text-sky-400" />;
      case 'news':
        return <Newspaper className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
      case 'job':
        return <Compass className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />;
      case 'email':
        return <Mail className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
    }
  };

  const jobStatuses: JobStatus[] = ['new', 'saved', 'applied', 'interview', 'rejected'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
        />

        {/* Sheet Content */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative z-10 w-full max-w-lg max-h-[90dvh] flex flex-col bg-white dark:bg-[#12121A] text-slate-900 dark:text-slate-100 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden"
        >
          {/* iOS Grab Handle */}
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-white/20 rounded-full mx-auto my-3 shrink-0" />

          {/* Modal Header Actions */}
          <div className="px-5 py-2 flex items-center justify-between border-b border-slate-100 dark:border-white/5 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              {getSourceIcon()}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {item.source_name}
              </span>
              <span aria-hidden="true" className="opacity-40">·</span>
              <span>{item.category}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleFavoriteToggle}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/5 active:scale-90 transition-all"
                title={t.favorite}
              >
                <Star
                  className={`w-4 h-4 ${
                    item.is_favorite ? 'text-amber-400 fill-amber-400' : ''
                  }`}
                />
              </button>
              <button
                onClick={handleShare}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 active:scale-90 transition-all"
                title={t.share}
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 active:scale-90 transition-all"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Modal Body */}
          <div className="p-5 overflow-y-auto no-scrollbar space-y-5">
            {/* Title & Date */}
            <div>
              <h2
                dir="auto"
                className="text-lg font-bold text-slate-900 dark:text-white leading-snug"
              >
                {item.title}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {formattedDate}
              </p>
            </div>

            {/* Job Radar Specific Spotlight */}
            {item.type === 'job' && item.job_meta && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>{item.job_meta.company}</span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {item.job_meta.location}
                      </span>
                      {item.job_meta.remote && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Laptop className="w-3.5 h-3.5" />
                          {t.remote}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-end">
                    <JobScoreRing score={item.job_meta.match_score} size={50} strokeWidth={4} />
                  </div>
                </div>

                {item.job_meta.salary_text && (
                  <div className="flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-200 bg-indigo-100/60 dark:bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-500/20 font-medium">
                    <DollarSign className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>{item.job_meta.salary_text}</span>
                  </div>
                )}

                {/* AI Rationale */}
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed border-t border-indigo-200/60 dark:border-indigo-500/20 pt-2.5">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-300 block mb-1">
                    {t.match_reason}:
                  </span>
                  <p dir="auto">{item.job_meta.match_reason}</p>
                </div>

                {/* Key Requirements Badges */}
                {item.job_meta.requirements && item.job_meta.requirements.length > 0 && (
                  <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-500/20">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                      {lang === 'fa' ? 'نیازمندی‌های کلیدی موقعیت:' : 'Key Requirements:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.job_meta.requirements.map((req, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium border border-indigo-500/20"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email Delivery Confirmation */}
                {item.job_meta.email_sent_to && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-medium">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {lang === 'fa'
                        ? `ارسال شده به ایمیل: ${item.job_meta.email_sent_to}`
                        : `Dispatched to: ${item.job_meta.email_sent_to}`}
                    </span>
                  </div>
                )}

                {/* Status Switcher (Interactive Buttons) */}
                <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-500/20">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-2 font-medium">
                    {lang === 'fa' ? 'تغییر وضعیت پیگیری شغل:' : 'Update Pipeline Status:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jobStatuses.map((st) => {
                      const isCurrent = item.job_meta?.status === st;
                      return (
                        <button
                          key={st}
                          onClick={() => handleJobStatusChange(st)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                            isCurrent
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-transparent'
                          }`}
                        >
                          {t[`status_${st}` as keyof typeof t]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* AI Summary Highlight */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-white dark:from-indigo-950/40 dark:via-[#181826] dark:to-[#12121A] border border-indigo-200/80 dark:border-indigo-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <span>{lang === 'fa' ? 'خلاصه هوشمند Gemini' : 'AI Summary by Gemini'}</span>
                </div>
                <button
                  onClick={handleReenrich}
                  disabled={isReenriching}
                  className="text-[11px] text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-white flex items-center gap-1 font-medium disabled:opacity-50"
                  title={t.reenrich}
                >
                  <Sparkles className={`w-3 h-3 ${isReenriching ? 'animate-spin' : ''}`} />
                  <span>{isReenriching ? (lang === 'fa' ? 'در حال بازتولید...' : 'Enriching...') : t.reenrich}</span>
                </button>
              </div>
              <p
                dir="auto"
                className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal"
              >
                {item.summary}
              </p>
            </div>

            {/* Full Content / Reader Mode */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
                {t.reader_mode}
              </h3>
              <div
                dir="auto"
                className="p-4 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal"
              >
                {item.content || item.summary}
              </div>
            </div>

            {/* Tags Manager */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {lang === 'fa' ? 'برچسب‌ها (قابل ویرایش)' : 'Tags (Editable)'}
                </span>
                {!isAddingTag && (
                  <button
                    onClick={() => setIsAddingTag(true)}
                    className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.add_tag}</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 items-center">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/5"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-rose-500 ms-1"
                      title="Remove tag"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {isAddingTag && (
                  <form onSubmit={handleAddTag} className="flex items-center gap-1">
                    <input
                      type="text"
                      autoFocus
                      placeholder={lang === 'fa' ? 'نام برچسب...' : 'Tag name...'}
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      className="h-7 px-2 text-xs rounded-lg bg-white dark:bg-black/50 border border-indigo-500 text-slate-900 dark:text-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="h-7 px-2 rounded-lg bg-indigo-600 text-white text-xs font-medium"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingTag(false)}
                      className="h-7 px-2 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs"
                    >
                      ✕
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="p-4 bg-slate-50 dark:bg-[#0F0F17] border-t border-slate-200 dark:border-white/5 flex items-center justify-between gap-3 shrink-0 pb-safe">
            <div className="flex items-center gap-1">
              <button
                onClick={handleArchiveToggle}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-all shadow-sm"
                title={item.is_archived ? t.unarchive : t.archive}
              >
                <Archive className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-transparent text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 active:scale-95 transition-all shadow-sm"
                title={t.delete}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {item.source_url ? (
              <a
                href={item.source_url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 h-11 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all"
              >
                <span>
                  {item.source_url.includes('jobinja')
                    ? 'مشاهده آگهی در جابینجا (jobinja.ir)'
                    : item.source_url.includes('jobvision')
                    ? 'مشاهده آگهی در جاب‌ویژن (jobvision.ir)'
                    : t.open_source}
                </span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 h-11 px-4 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-medium text-xs sm:text-sm flex items-center justify-center active:scale-[0.98] transition-all"
              >
                {lang === 'fa' ? 'بستن' : 'Close'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
