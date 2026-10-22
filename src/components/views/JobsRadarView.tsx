import React, { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  Briefcase,
  Play,
  Mail,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Clock,
  X,
  Copy,
  Check,
  Radar,
} from 'lucide-react';
import { Item, JobStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { ItemCard } from '../ItemCard';
import { formatPercent, toPersianDigits } from '../../utils/format';

type PortalFilter = 'all' | 'jobinja' | 'jobvision' | 'remote' | 'tehran';

export const JobsRadarView: React.FC = () => {
  const { lang, t, setSelectedItem, reloadTrigger, runIranJob, isRunningJob, showToast } = useApp();
  const [allJobs, setAllJobs] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [portalFilter, setPortalFilter] = useState<PortalFilter>('all');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
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
      showToast('آگهی به آرشیو منتقل شد', 'info');
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

  let items = allJobs;
  if (statusFilter !== 'all') {
    items = items.filter((i) => i.job_meta?.status === statusFilter);
  }
  if (minScoreFilter > 0) {
    items = items.filter((i) => (i.job_meta?.match_score ?? 0) >= minScoreFilter);
  }
  if (portalFilter === 'jobinja') {
    items = items.filter(
      (i) =>
        i.source_name.includes('jobinja') ||
        i.source_url?.includes('jobinja') ||
        i.job_meta?.source_platform === 'jobinja'
    );
  } else if (portalFilter === 'jobvision') {
    items = items.filter(
      (i) =>
        i.source_name.includes('jobvision') ||
        i.source_url?.includes('jobvision') ||
        i.job_meta?.source_platform === 'jobvision'
    );
  } else if (portalFilter === 'remote') {
    items = items.filter((i) => i.job_meta?.remote === true);
  } else if (portalFilter === 'tehran') {
    items = items.filter(
      (i) =>
        i.job_meta?.location.toLowerCase().includes('tehran') ||
        i.job_meta?.location.includes('تهران')
    );
  }

  const highMatchCount = allJobs.filter((i) => (i.job_meta?.match_score ?? 0) >= 80).length;
  const iranJobsCount = allJobs.filter(
    (i) =>
      i.source_name.includes('jobinja') ||
      i.source_name.includes('jobvision') ||
      i.source_url?.includes('jobinja') ||
      i.source_url?.includes('jobvision')
  ).length;
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

  const userEmail = 'job.msalehi@gmail.com';

  const generateEmailReportText = () => {
    const header = `فرصت‌های شغلی جدید (جابینجا و جاب‌ویژن) - ${new Date().toLocaleDateString('fa-IR')}\n\nمحمدرضا صالحی عزیز،\nبر اساس مهارت‌های شما (پایتون، جنگو، FastAPI، معماری میکروسرویس، PostgreSQL، وب‌اسکرپینگ، ردیس، الستیک، رابیت و سیستم‌های LLM Agents با ۴+ سال سابقه)، آگهی‌های منتخب ۲۴ ساعت گذشته به شرح زیر است:\n\n`;

    const jobEntries = items
      .filter((i) => (i.job_meta?.match_score ?? 0) >= 80)
      .slice(0, 5)
      .map(
        (j, index) =>
          `• ${index + 1}. ${j.title} (${j.job_meta?.company})\n• درصد تطابق: ${formatPercent(j.job_meta?.match_score ?? 0)}\n• منبع: ${j.source_name}\n• شرایط همکاری: ${j.job_meta?.location} ${j.job_meta?.remote ? '(دورکاری کامل)' : ''}\n• حقوق: ${j.job_meta?.salary_text || 'توافقی'}\n• نیازمندی‌های اصلی: ${j.job_meta?.requirements?.join('، ') || 'Python, Backend'}\n• تحلیل هوش مصنوعی: ${j.job_meta?.match_reason}\n• لینک آگهی یا جستجوی مشابه: ${j.source_url}\n`
      )
      .join('\n');

    const footer = `\nسیستم خودکار رادار شغلی هوش مصنوعی جمنای\nارسال بعدی: فردا راس ساعت ۰۸:۰۰ صبح`;
    return header + jobEntries + footer;
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(generateEmailReportText());
    setCopiedEmail(true);
    showToast('متن گزارش ایمیل با موفقیت کپی شد', 'success');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Radar hero */}
      <section className="px-4">
        <div className="ios-glass-card ios-specular relative overflow-hidden p-[18px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -start-20 h-64 w-64 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(16,185,129,0.36), rgba(6,182,212,0.14) 55%, transparent 72%)',
              filter: 'blur(26px)',
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -end-10 h-44 w-44 rounded-full opacity-60"
            style={{
              background:
                'conic-gradient(from 210deg at 50% 50%, transparent 0deg, rgba(52,211,153,0.25) 60deg, transparent 130deg)',
              filter: 'blur(18px)',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-300/25 bg-emerald-400/12 text-emerald-200">
                  <Radar className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    رادار هوشمند پایتون
                  </h2>
                  <p className="text-[10px] text-slate-400">جابینجا و جاب‌ویژن · Gemini</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-400/12 px-2 py-1 text-[9px] font-bold text-emerald-200">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                اتوماسیون فعال
              </span>
            </div>

            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <div className="flex items-baseline gap-1">
                  <div className="metric-number ios-glass-text text-[3rem] font-extrabold leading-none">
                    {toPersianDigits(avgMatch)}
                  </div>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-200/80">٪</span>
                </div>
                <p className="mt-1 text-[10.5px] font-medium text-emerald-700 dark:text-emerald-200/80">
                  میانگین تطابق با پروفایل شما
                </p>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="ios-glass-subtile min-w-[52px] px-2 py-2 text-center">
                  <div className="text-sm font-extrabold leading-none text-cyan-200">
                    {toPersianDigits(pipeline.saved)}
                  </div>
                  <p className="mt-1 text-[8.5px] text-slate-400">ذخیره</p>
                </div>
                <div className="ios-glass-subtile min-w-[52px] px-2 py-2 text-center">
                  <div className="text-sm font-extrabold leading-none text-sky-200">
                    {toPersianDigits(pipeline.applied)}
                  </div>
                  <p className="mt-1 text-[8.5px] text-slate-400">رزومه</p>
                </div>
                <div className="ios-glass-subtile min-w-[52px] px-2 py-2 text-center">
                  <div className="text-sm font-extrabold leading-none text-emerald-300">
                    {toPersianDigits(pipeline.interview)}
                  </div>
                  <p className="mt-1 text-[8.5px] text-slate-400">مصاحبه</p>
                </div>
              </div>
            </div>

            <div className="no-scrollbar mt-3 flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {monitoredSkills.map((skill) => (
                <span
                  key={skill}
                  className="shrink-0 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2.5 py-1 text-[9.5px] font-semibold text-emerald-100 backdrop-blur-md"
                >
                  <bdi dir="ltr">{skill}</bdi>
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => runIranJob()}
                disabled={isRunningJob}
                className="ios-press flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-emerald-300/40 bg-gradient-to-r from-emerald-500/80 to-teal-500/70 px-4 text-[11px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_22px_-8px_rgba(16,185,129,0.7)] disabled:opacity-50"
              >
                <Play className={`h-3.5 w-3.5 fill-current ${isRunningJob ? 'animate-spin' : ''}`} />
                <span>{isRunningJob ? 'در حال اسکن و تحلیل...' : 'اسکن فوری پورتال‌ها'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowEmailModal(true)}
                className="ios-action-pill"
                title="پیش‌نمایش ایمیل روزانه"
              >
                <Mail className="h-3.5 w-3.5 text-cyan-300" />
                <span>ایمیل</span>
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/[0.07] pt-2.5 text-[9.5px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-emerald-300" />
                ارسال روزانه ۰۸:۰۰
              </span>
              <span className="flex items-center gap-1 truncate">
                <Mail className="h-3 w-3 text-cyan-300" />
                <span className="truncate">{userEmail}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Portal filter rail */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 pb-0.5">
        {portalOptions.map((opt) => {
          const isActive = portalFilter === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setPortalFilter(opt.id)}
              title={opt.full}
              className={`ios-press shrink-0 px-3 py-2 text-[11px] font-semibold transition-all ${
                isActive ? 'ios-glass-pill-active' : 'ios-glass-pill text-slate-300'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Status + score rail */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4">
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
          {statuses.map((st) => {
            const isActive = statusFilter === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-semibold transition-all ${
                  isActive
                    ? 'border border-white/25 bg-white/90 text-slate-900 shadow-sm dark:border-white/15 dark:bg-white/15 dark:text-white'
                    : 'border border-white/[0.07] bg-white/[0.045] text-slate-400 backdrop-blur-md hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <span className="font-medium">حداقل:</span>
          {[0, 80, 90].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => setMinScoreFilter(score)}
              className={`rounded-full px-2 py-1 font-medium transition-colors ${
                minScoreFilter === score
                  ? 'ios-glass-emerald'
                  : 'border border-white/[0.07] bg-white/[0.045] text-slate-400'
              }`}
            >
              {score === 0 ? 'همه' : `${toPersianDigits(score)}٪+`}
            </button>
          ))}
        </div>
      </div>

      {/* Counts */}
      <div className="flex items-center justify-between px-4 text-[10px] text-slate-400">
        <span>{toPersianDigits(items.length)} آگهی در نمای فعلی</span>
        <span className="text-emerald-300/90">
          {toPersianDigits(highMatchCount)} تطابق بالای ۸۰٪ · {toPersianDigits(iranJobsCount)} ایرانی
        </span>
      </div>

      {/* Jobs list */}
      <div className="px-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="ios-glass-card ios-skeleton h-[164px] rounded-[26px]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="ios-glass-card ios-specular px-6 py-9 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.empty_jobs_title}</h3>
            <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              آگهی منطبق با فیلتر انتخابی یافت نشد. رادار را اجرا کنید تا هوش مصنوعی آگهی‌های جدید را استخراج و تحلیل کند.
            </p>
            <button
              type="button"
              onClick={() => runIranJob()}
              className="ios-press mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/35 bg-emerald-500/20 px-4 py-2 text-[11px] font-bold text-emerald-100"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>اجرای فوری اسکن</span>
            </button>
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

      {/* Email preview bottom sheet */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
            onClick={() => setShowEmailModal(false)}
          />

          <div
            className="ios-glass-sheet relative flex max-h-[88dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[38px]"
            dir="rtl"
          >
            <div className="ios-grabber shrink-0" />

            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-400/12 text-cyan-200">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">پیش‌نمایش ایمیل روزانه</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    گیرنده: <span className="font-mono text-cyan-300">{userEmail}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="ios-glass-pill flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold text-slate-200"
                >
                  {copiedEmail ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedEmail ? 'کپی شد' : 'کپی'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="ios-icon-button h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="no-scrollbar space-y-4 overflow-y-auto p-5 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-[10.5px] text-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>این گزارش هر روز راس ساعت ۰۸:۰۰ صبح با جمنای تولید و به ایمیل شما ارسال می‌شود.</span>
              </div>

              <div className="ios-glass-subtile space-y-2 p-3.5 text-[10.5px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">گیرنده:</span>
                  <span className="font-semibold text-cyan-300">{userEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">فرستنده:</span>
                  <span className="font-semibold text-slate-300">رادار شغلی هوش مصنوعی</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="shrink-0 text-slate-400">موضوع:</span>
                  <span className="truncate font-semibold text-slate-900 dark:text-white">
                    گزارش روزانه موقعیت‌های پایتون و جنگو
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  موقعیت‌های استخراج‌شده ({toPersianDigits(items.filter((i) => (i.job_meta?.match_score ?? 0) >= 80).length)}):
                </h4>

                {items
                  .filter((i) => (i.job_meta?.match_score ?? 0) >= 80)
                  .slice(0, 4)
                  .map((job, idx) => (
                    <div key={job.id} className="ios-glass-subtile space-y-2 p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="block truncate text-[11px] font-bold text-cyan-200">
                            {toPersianDigits(idx + 1)}. {job.title}
                          </span>
                          <span className="mt-0.5 block text-[10px] text-slate-400">
                            {job.job_meta?.company} · {job.source_name}
                          </span>
                        </div>
                        <span className="ios-glass-emerald shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold">
                          {toPersianDigits(job.job_meta?.match_score || 0)}٪
                        </span>
                      </div>

                      <p className="line-clamp-2 text-[10.5px] leading-relaxed text-slate-600 dark:text-slate-300">
                        {job.job_meta?.match_reason}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-2 text-[9.5px]">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <span>{job.job_meta?.location}</span>
                          {job.job_meta?.remote && <span className="font-semibold text-emerald-300">(دورکاری)</span>}
                        </div>
                        {job.source_url && (
                          <a
                            href={job.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 font-semibold text-cyan-300"
                          >
                            <span>منبع</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.08] px-5 pb-safe pt-3 text-[10px]">
              <span className="text-slate-400">
                وضعیت: <span className="font-bold text-emerald-300">ارسال موفق</span>
              </span>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="ios-press rounded-full border border-slate-300/60 bg-slate-900/[0.06] px-4 py-2 text-[11px] font-bold text-slate-900 dark:border-white/15 dark:bg-white/10 dark:text-white"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
