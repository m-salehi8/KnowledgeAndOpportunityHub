// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Briefcase,
  Play,
  Mail,
  ExternalLink,
  CheckCircle2,
  Clock,
  X,
  Copy,
  Check,
  Radar,
  ArrowUpDown,
} from 'lucide-react';
import { Item, JobStatus } from '../../types';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { ItemCard } from '../ItemCard';
import { formatPercent, toPersianDigits } from '../../utils/format';
import { ActionSheet, Chip, EmptyState, Pressable, ProgressRing } from '../ui';

type PortalFilter = 'all' | 'jobinja' | 'jobvision' | 'remote' | 'tehran';
type SortKey = 'score' | 'recent' | 'company';

const SORT_LABELS: Record<SortKey, string> = {
  score: 'بیشترین تطابق',
  recent: 'جدیدترین',
  company: 'نام شرکت',
};

const STATUS_ORDER: JobStatus[] = ['new', 'saved', 'applied', 'interview', 'rejected'];

export const JobsRadarView: React.FC = () => {
  const { t, setSelectedItem, reloadTrigger, runIranJob, isRunningJob, showToast } = useApp();
  const [allJobs, setAllJobs] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [portalFilter, setPortalFilter] = useState<PortalFilter>('all');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [statusTarget, setStatusTarget] = useState<Item | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await api.getItems({ type: 'job', is_archived: false });
      setAllJobs(res.items);
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    setLoading(true);
    fetchJobs();
  }, [fetchJobs, reloadTrigger]);

  const handleFavoriteToggle = async (item: Item) => {
    try {
      const updated = await api.patchItem(item.id, { is_favorite: !item.is_favorite });
      setAllJobs((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleArchiveToggle = async (item: Item) => {
    try {
      await api.patchItem(item.id, { is_archived: !item.is_archived });
      setAllJobs((prev) => prev.filter((i) => i.id !== item.id));
      showToast('آگهی به بایگانی منتقل شد', 'info');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleStatusChange = async (status: JobStatus) => {
    const target = statusTarget;
    setStatusTarget(null);
    if (!target) return;
    try {
      const updated = await api.patchJobStatus(target.id, status);
      setAllJobs((prev) => prev.map((i) => (i.id === target.id ? updated : i)));
      showToast(`وضعیت به «${t[`status_${status}` as keyof typeof t]}» تغییر یافت`, 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const statuses: Array<{ id: JobStatus | 'all'; label: string }> = [
    { id: 'all', label: t.type_all },
    { id: 'new', label: t.status_new },
    { id: 'saved', label: t.status_saved },
    { id: 'applied', label: t.status_applied },
    { id: 'interview', label: t.status_interview },
    { id: 'rejected', label: t.status_rejected },
  ];

  const portalOptions: Array<{ id: PortalFilter; label: string; full: string }> = [
    { id: 'all', label: 'همه', full: 'همه آگهی‌ها' },
    { id: 'jobinja', label: 'جابینجا', full: 'جابینجا (jobinja.ir)' },
    { id: 'jobvision', label: 'جاب‌ویژن', full: 'جاب‌ویژن (jobvision.ir)' },
    { id: 'remote', label: 'دورکاری', full: 'دورکاری کامل (Remote)' },
    { id: 'tehran', label: 'تهران', full: 'استان تهران' },
  ];

  const items = useMemo(() => {
    let list = allJobs;

    if (statusFilter !== 'all') {
      list = list.filter((i) => i.job_meta?.status === statusFilter);
    }
    if (minScoreFilter > 0) {
      list = list.filter((i) => (i.job_meta?.match_score ?? 0) >= minScoreFilter);
    }
    if (portalFilter === 'jobinja') {
      list = list.filter(
        (i) =>
          i.source_name.includes('jobinja') ||
          i.source_url?.includes('jobinja') ||
          i.job_meta?.source_platform === 'jobinja'
      );
    } else if (portalFilter === 'jobvision') {
      list = list.filter(
        (i) =>
          i.source_name.includes('jobvision') ||
          i.source_url?.includes('jobvision') ||
          i.job_meta?.source_platform === 'jobvision'
      );
    } else if (portalFilter === 'remote') {
      list = list.filter((i) => i.job_meta?.remote === true);
    } else if (portalFilter === 'tehran') {
      list = list.filter(
        (i) =>
          i.job_meta?.location.toLowerCase().includes('tehran') ||
          i.job_meta?.location.includes('تهران')
      );
    }

    const sorted = [...list];
    if (sortKey === 'score') {
      sorted.sort((a, b) => (b.job_meta?.match_score ?? 0) - (a.job_meta?.match_score ?? 0));
    } else if (sortKey === 'recent') {
      sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else {
      sorted.sort((a, b) => (a.job_meta?.company ?? '').localeCompare(b.job_meta?.company ?? ''));
    }
    return sorted;
  }, [allJobs, statusFilter, minScoreFilter, portalFilter, sortKey]);

  const highMatchCount = allJobs.filter((i) => (i.job_meta?.match_score ?? 0) >= 80).length;
  const avgMatch = allJobs.length
    ? Math.round(
        allJobs.reduce((sum, item) => sum + (item.job_meta?.match_score ?? 0), 0) / allJobs.length
      )
    : 0;
  const pipeline = {
    saved: allJobs.filter((i) => i.job_meta?.status === 'saved').length,
    applied: allJobs.filter((i) => i.job_meta?.status === 'applied').length,
    interview: allJobs.filter((i) => i.job_meta?.status === 'interview').length,
  };

  const monitoredSkills = [
    'Python',
    'Django',
    'FastAPI',
    'PostgreSQL',
    'Redis',
    'Docker',
    'LLM Agents',
  ];

  // Mock preview uses a neutral placeholder — never a real mailbox.
  const userEmail = 'user@example.com';

  const generateEmailReportText = () => {
    const header = `فرصت‌های شغلی جدید (جابینجا و جاب‌ویژن) - ${new Date().toLocaleDateString('fa-IR')}\n\nگزارش روزانه فرصت‌های شغلی متناسب با مهارت‌های ثبت‌شده:\n\n`;
    const jobEntries = items
      .filter((i) => (i.job_meta?.match_score ?? 0) >= 80)
      .slice(0, 5)
      .map(
        (j, index) =>
          `• ${index + 1}. ${j.title} (${j.job_meta?.company})\n• درصد تطابق: ${formatPercent(j.job_meta?.match_score ?? 0)}\n• منبع: ${j.source_name}\n• شرایط همکاری: ${j.job_meta?.location} ${j.job_meta?.remote ? '(دورکاری کامل)' : ''}\n• حقوق: ${j.job_meta?.salary_text || 'توافقی'}\n• نیازمندی‌های اصلی: ${j.job_meta?.requirements?.join('، ') || 'Python, Backend'}\n• تحلیل هوش مصنوعی: ${j.job_meta?.match_reason}\n• لینک آگهی یا جستجوی مشابه: ${j.source_url}\n`
      )
      .join('\n');
    const footer = `\nرادار شغلی هوش مصنوعی — ارسال بعدی: فردا راس ساعت ۰۸:۰۰`;
    return header + jobEntries + footer;
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(generateEmailReportText());
    setCopiedEmail(true);
    showToast('متن گزارش ایمیل کپی شد', 'success');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="px-4">
      {/* Radar summary card */}
      <section className="ios-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-[10px]"
              style={{ background: 'var(--success-soft)', color: 'var(--success)' }}
              aria-hidden="true"
            >
              <Radar className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">
                رادار هوشمند شغل
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                جابینجا و جاب‌ویژن · تحلیل هوش مصنوعی
              </p>
            </div>
          </div>
          <span className="ios-chip h-[24px] min-h-[24px] px-2 text-[10px]" data-tone="success">
            فعال
          </span>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <ProgressRing value={avgMatch} size={62} strokeWidth={6} />

          <div className="grid flex-1 grid-cols-3 gap-2">
            {[
              { value: pipeline.saved, label: 'ذخیره' },
              { value: pipeline.applied, label: 'رزومه' },
              { value: pipeline.interview, label: 'مصاحبه' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-[18px] font-bold leading-none text-[var(--text-primary)] tabular">
                  {toPersianDigits(stat.value)}
                </p>
                <p className="mt-1 text-[10px] text-[var(--text-secondary)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="no-scrollbar mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
          {monitoredSkills.map((skill) => (
            <span key={skill} className="ios-chip h-[26px] min-h-[26px] px-2.5 text-[11px]">
              <bdi dir="ltr">{skill}</bdi>
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Pressable
            onClick={() => runIranJob()}
            disabled={isRunningJob}
            className="ios-btn ios-btn-primary h-11 flex-1 text-[14px] disabled:opacity-50"
          >
            <Play className={`h-4 w-4 ${isRunningJob ? 'animate-spin' : ''}`} strokeWidth={1.75} />
            <span>{isRunningJob ? 'در حال اسکن...' : 'اسکن فوری پورتال‌ها'}</span>
          </Pressable>

          <Pressable
            onClick={() => setShowEmailModal(true)}
            className="ios-btn ios-btn-secondary h-11 px-4 text-[14px]"
            aria-label="پیش‌نمایش ایمیل روزانه"
          >
            <Mail className="h-4 w-4" strokeWidth={1.75} />
            <span>ایمیل</span>
          </Pressable>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t-0.5px border-[var(--separator)] pt-2.5 text-[11px] text-[var(--text-secondary)]">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-[var(--success)]" strokeWidth={1.75} />
            ارسال روزانه ۰۸:۰۰
          </span>
          <span className="flex items-center gap-1 truncate">
            <Mail className="h-3 w-3 text-[var(--accent)]" strokeWidth={1.75} />
            <bdi dir="ltr">{userEmail}</bdi>
          </span>
        </div>
      </section>

      {/* Portal filters */}
      <div className="no-scrollbar snap-x mt-4 flex items-center gap-2 overflow-x-auto pb-1">
        {portalOptions.map((opt) => (
          <Pressable
            key={opt.id}
            onClick={() => setPortalFilter(opt.id)}
            className="snap-start shrink-0"
            title={opt.full}
            aria-pressed={portalFilter === opt.id}
          >
            <span className="ios-chip" data-active={portalFilter === opt.id}>
              {opt.label}
            </span>
          </Pressable>
        ))}
      </div>

      {/* Status + score + sort */}
      <div className="mt-3 flex items-center gap-2">
        <div className="no-scrollbar flex flex-1 items-center gap-1.5 overflow-x-auto">
          {statuses.map((st) => (
            <Pressable
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className="shrink-0"
              aria-pressed={statusFilter === st.id}
            >
              <span className="ios-chip h-[28px] min-h-[28px] text-[11px]" data-active={statusFilter === st.id}>
                {st.label}
              </span>
            </Pressable>
          ))}
        </div>

        <Pressable
          onClick={() => setShowSortSheet(true)}
          className="ios-icon-button h-9 w-9 shrink-0"
          aria-label="مرتب‌سازی"
        >
          <ArrowUpDown className="h-4 w-4" strokeWidth={1.75} />
        </Pressable>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <span className="text-[11px] text-[var(--text-secondary)]">حداقل امتیاز:</span>
        {[0, 50, 80].map((score) => (
          <Chip
            key={score}
            active={minScoreFilter === score}
            onClick={() => setMinScoreFilter(score)}
            className="h-[26px] min-h-[26px] px-2 text-[11px]"
          >
            {score === 0 ? 'همه' : `${toPersianDigits(score)}٪+`}
          </Chip>
        ))}
      </div>

      {/* Counts */}
      <div className="mt-4 flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
        <span>{toPersianDigits(items.length)} آگهی در نمای فعلی</span>
        <span className="text-[var(--success)]">
          {toPersianDigits(highMatchCount)} تطابق بالای ۸۰٪
        </span>
      </div>

      {/* Jobs list */}
      <div className="mt-2">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="ios-skeleton h-[190px] rounded-[var(--r-card)]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="ios-card">
            <EmptyState
              icon={<Briefcase className="h-7 w-7" strokeWidth={1.5} />}
              title={t.empty_jobs_title}
              description="آگهی منطبق با فیلتر انتخابی یافت نشد. رادار را اجرا کنید تا هوش مصنوعی آگهی‌های جدید را استخراج و تحلیل کند."
              action={
                <Pressable
                  onClick={() => runIranJob()}
                  className="ios-btn ios-btn-primary h-11 px-5 text-[15px]"
                >
                  <Play className="h-4 w-4" strokeWidth={1.75} />
                  <span>اجرای فوری اسکن</span>
                </Pressable>
              }
            />
          </div>
        ) : (
          items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onFavoriteToggle={handleFavoriteToggle}
              onArchiveToggle={handleArchiveToggle}
              onSelect={setSelectedItem}
              onStatusChange={(target) => setStatusTarget(target)}
            />
          ))
        )}
      </div>

      {/* Sort action sheet */}
      <ActionSheet
        open={showSortSheet}
        onClose={() => setShowSortSheet(false)}
        title="مرتب‌سازی بر اساس"
        options={(Object.keys(SORT_LABELS) as SortKey[]).map((key) => ({
          id: key,
          label: SORT_LABELS[key],
          selected: sortKey === key,
        }))}
        onSelect={(id) => {
          setSortKey(id as SortKey);
          setShowSortSheet(false);
        }}
      />

      {/* Job status action sheet */}
      <ActionSheet
        open={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        title="وضعیت درخواست"
        message={statusTarget?.title}
        options={STATUS_ORDER.map((status) => ({
          id: status,
          label: t[`status_${status}` as keyof typeof t],
          selected: statusTarget?.job_meta?.status === status,
        }))}
        onSelect={(id) => handleStatusChange(id as JobStatus)}
      />

      {/* Email preview bottom sheet */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center" dir="rtl">
          <div className="absolute inset-0 bg-black/45" onClick={() => setShowEmailModal(false)} />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="relative flex max-h-[88dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[24px] ios-sheet"
          >
            <div className="ios-sheet-handle" />

            <div className="flex items-center justify-between gap-2 border-b-0.5px border-[var(--separator)] px-4 pb-3 pt-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[10px]"
                  style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                  aria-hidden="true"
                >
                  <Mail className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                    پیش‌نمایش ایمیل روزانه
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    گیرنده: <bdi dir="ltr">{userEmail}</bdi>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Pressable
                  onClick={handleCopyEmail}
                  className="ios-btn ios-btn-secondary h-9 min-h-9 px-3 text-[12px]"
                >
                  {copiedEmail ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={1.75} />
                  ) : (
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
                  )}
                  <span>{copiedEmail ? 'کپی شد' : 'کپی'}</span>
                </Pressable>
                <Pressable
                  onClick={() => setShowEmailModal(false)}
                  className="ios-icon-button h-9 w-9"
                  aria-label="بستن"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </Pressable>
              </div>
            </div>

            <div className="no-scrollbar space-y-4 overflow-y-auto p-4 text-[13px] leading-[1.8] text-[var(--text-secondary)]">
              <div
                className="flex items-start gap-2 rounded-[var(--r-control)] p-3 text-[12px]"
                style={{ background: 'var(--success-soft)', color: 'var(--success)' }}
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span>این گزارش هر روز راس ساعت ۰۸:۰۰ صبح تولید و ارسال می‌شود.</span>
              </div>

              <div className="ios-card p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[var(--text-secondary)]">گیرنده:</span>
                  <bdi dir="ltr" className="font-medium text-[var(--accent)]">
                    {userEmail}
                  </bdi>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-[var(--text-secondary)]">فرستنده:</span>
                  <span className="font-medium text-[var(--text-primary)]">رادار شغلی هوش مصنوعی</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-[13px] font-semibold text-[var(--text-primary)]">
                  موقعیت‌های استخراج‌شده (
                  {toPersianDigits(items.filter((i) => (i.job_meta?.match_score ?? 0) >= 80).length)})
                </h4>

                {items
                  .filter((i) => (i.job_meta?.match_score ?? 0) >= 80)
                  .slice(0, 4)
                  .map((job, idx) => (
                    <div key={job.id} className="ios-card p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="block truncate text-[13px] font-semibold text-[var(--text-primary)]">
                            {toPersianDigits(idx + 1)}. {job.title}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-[var(--text-secondary)]">
                            {job.job_meta?.company} · {job.source_name}
                          </span>
                        </div>
                        <span className="ios-chip h-[24px] min-h-[24px] shrink-0 px-2 text-[11px]" data-tone="success">
                          {toPersianDigits(job.job_meta?.match_score || 0)}٪
                        </span>
                      </div>

                      <p className="mt-2 line-clamp-2 text-[12px] leading-[1.7]">
                        {job.job_meta?.match_reason}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2 border-t-0.5px border-[var(--separator)] pt-2 text-[11px]">
                        <span className="truncate">{job.job_meta?.location}</span>
                        {job.source_url && (
                          <a
                            href={job.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex shrink-0 items-center gap-1 font-medium text-[var(--accent)]"
                          >
                            <span>منبع</span>
                            <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t-0.5px border-[var(--separator)] px-4 pb-safe pt-3 text-[11px]">
              <span className="text-[var(--text-secondary)]">
                وضعیت: <span className="font-semibold text-[var(--success)]">ارسال موفق</span>
              </span>
              <Pressable
                onClick={() => setShowEmailModal(false)}
                className="ios-btn ios-btn-secondary h-10 min-h-10 px-4 text-[13px]"
              >
                بستن
              </Pressable>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
