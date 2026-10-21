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
  MapPin,
  Laptop,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { Item, JobStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { ItemCard } from '../ItemCard';
import { toPersianDigits } from '../../utils/format';

type PortalFilter = 'all' | 'jobinja' | 'jobvision' | 'remote' | 'tehran';

export const JobsRadarView: React.FC = () => {
  const { lang, t, setSelectedItem, reloadTrigger, runIranJob, isRunningJob, showToast } = useApp();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [portalFilter, setPortalFilter] = useState<PortalFilter>('all');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await api.getItems({
        type: 'job',
        job_status: statusFilter === 'all' ? undefined : statusFilter,
        min_score: minScoreFilter > 0 ? minScoreFilter : undefined,
        is_archived: false,
      });

      let filtered = res.items;
      if (portalFilter === 'jobinja') {
        filtered = filtered.filter(
          (i) => i.source_name.includes('jobinja') || i.source_url?.includes('jobinja') || i.job_meta?.source_platform === 'jobinja'
        );
      } else if (portalFilter === 'jobvision') {
        filtered = filtered.filter(
          (i) => i.source_name.includes('jobvision') || i.source_url?.includes('jobvision') || i.job_meta?.source_platform === 'jobvision'
        );
      } else if (portalFilter === 'remote') {
        filtered = filtered.filter((i) => i.job_meta?.remote === true);
      } else if (portalFilter === 'tehran') {
        filtered = filtered.filter((i) => i.job_meta?.location.toLowerCase().includes('tehran') || i.job_meta?.location.includes('تهران'));
      }

      setItems(filtered);
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, portalFilter, minScoreFilter, showToast]);

  useEffect(() => {
    setLoading(true);
    fetchJobs();
  }, [fetchJobs, reloadTrigger]);

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
      await api.patchItem(item.id, { is_archived: !item.is_archived });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
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

  const portalOptions: Array<{ id: PortalFilter; label: string }> = [
    { id: 'all', label: 'همه آگهی‌ها' },
    { id: 'jobinja', label: 'جابینجا (jobinja.ir)' },
    { id: 'jobvision', label: 'جاب‌ویژن (jobvision.ir)' },
    { id: 'remote', label: 'دورکاری کامل (Remote)' },
    { id: 'tehran', label: 'استان تهران' },
  ];

  const highMatchCount = items.filter((i) => (i.job_meta?.match_score ?? 0) >= 80).length;
  const iranJobsCount = items.filter(
    (i) => i.source_name.includes('jobinja') || i.source_name.includes('jobvision') || i.source_url?.includes('jobinja') || i.source_url?.includes('jobvision')
  ).length;

  const userEmail = 'job.msalehi@gmail.com';

  const generateEmailReportText = () => {
    const header = `فرصت‌های شغلی جدید (جابینجا و جاب‌ویژن) - ${new Date().toLocaleDateString('fa-IR')}\n\nمحمدرضا صالحی عزیز،\nبر اساس مهارت‌های شما (پایتون، جنگو، FastAPI، معماری میکروسرویس، PostgreSQL، وب‌اسکرپینگ، ردیس، الستیک، رابیت و سیستم‌های LLM Agents با ۴+ سال سابقه)، آگهی‌های منتخب ۲۴ ساعت گذشته به شرح زیر است:\n\n`;

    const jobEntries = items
      .filter((i) => (i.job_meta?.match_score ?? 0) >= 80)
      .slice(0, 5)
      .map(
        (j, index) =>
          `📌 ${index + 1}. ${j.title} (${j.job_meta?.company})\n• درصد تطابق: ${j.job_meta?.match_score}%\n• منبع: ${j.source_name}\n• شرایط همکاری: ${j.job_meta?.location} ${j.job_meta?.remote ? '(دورکاری کامل)' : ''}\n• حقوق: ${j.job_meta?.salary_text || 'توافقی'}\n• نیازمندی‌های اصلی: ${j.job_meta?.requirements?.join('، ') || 'Python, Backend'}\n• تحلیل هوش مصنوعی: ${j.job_meta?.match_reason}\n• لینک مستقیم آگهی: ${j.source_url}\n`
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
    <div className="space-y-4 pb-24 px-4">
      {/* Iranian Job Portals & Gemini AI Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-950 via-[#16162a] to-[#0d0d17] text-white border border-indigo-500/30 space-y-4 shadow-xl shadow-indigo-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white">
                  رادار هوشمند پایتون (جابینجا و جاب‌ویژن)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  اتوماسیون فعال با جمنای
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                جستجوی روزانه آگهی‌های پایتون، جنگو و FastAPI و تطبیق هوشمند با رزومه ۴+ سال شما
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => runIranJob()}
              disabled={isRunningJob}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 active:scale-95 transition-all disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 fill-current ${isRunningJob ? 'animate-spin' : ''}`} />
              <span>{isRunningJob ? 'در حال اسکن و تحلیل...' : 'اسکن فوری جابینجا و جاب‌ویژن'}</span>
            </button>

            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 text-xs font-semibold active:scale-95 transition-all"
              title="مشاهده پیش‌نمایش ایمیل روزانه"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-300" />
              <span className="hidden sm:inline">پیش‌نمایش ایمیل</span>
            </button>
          </div>
        </div>

        {/* Profile Match Criteria Summary */}
        <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              مهارت‌های تحت پایش برای تطابق:
            </span>
            <span className="text-[11px] text-slate-400">سابقه: بیش از ۴ سال</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Python',
              'Django',
              'FastAPI',
              'Flask',
              'PostgreSQL',
              'Redis',
              'Elasticsearch',
              'RabbitMQ',
              'Docker',
              'Microservices',
              'Scrapy',
              'LLM Agents',
            ].map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-400/25 text-indigo-200 text-[10px] font-medium"
              >
                {skill}
              </span>
            ))}
            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-400/25 text-emerald-200 text-[10px] font-medium">
              اولویت: دورکاری (Remote) / تهران
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
            <div className="flex items-center gap-1 text-emerald-400">
              <Clock className="w-3 h-3" />
              <span>ارسال خودکار روزانه: ساعت ۰۸:۰۰ صبح</span>
            </div>
            <div className="flex items-center gap-1 text-slate-300 truncate max-w-[200px]">
              <Mail className="w-3 h-3 text-indigo-400" />
              <span className="truncate">{userEmail}</span>
            </div>
          </div>
        </div>

        {/* Numbers Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">کل آگهی‌ها</span>
            <span className="text-base font-bold text-white font-sans">
              {toPersianDigits(items.length)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="text-[10px] text-emerald-400 block font-medium">تطابق بالا (+۸۰٪)</span>
            <span className="text-base font-bold text-emerald-300 font-sans">
              {toPersianDigits(highMatchCount)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
            <span className="text-[10px] text-indigo-300 block font-medium">جابینجا و جاب‌ویژن</span>
            <span className="text-base font-bold text-indigo-200 font-sans">
              {toPersianDigits(iranJobsCount)}
            </span>
          </div>
        </div>
      </div>

      {/* Portal Filter Pills */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-[#151520] rounded-2xl overflow-x-auto no-scrollbar border border-slate-300/60 dark:border-white/5">
        {portalOptions.map((opt) => {
          const isActive = portalFilter === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setPortalFilter(opt.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all active:scale-95 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Kanban Status Filter & Score Filter */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {statuses.map((st) => {
            const isActive = statusFilter === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-sm'
                    : 'bg-slate-200/70 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>

        {/* Score Threshold */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="text-[11px] font-medium">حداقل تطابق:</span>
          {[0, 80, 90].map((score) => (
            <button
              key={score}
              onClick={() => setMinScoreFilter(score)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                minScoreFilter === score
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {score === 0 ? 'همه' : `${toPersianDigits(score)}٪+`}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="p-4 rounded-2xl bg-white dark:bg-[#14141E] border border-slate-200 dark:border-white/5 animate-pulse h-32 shadow-sm"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#14141E] border border-slate-200 dark:border-white/5 space-y-2 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.empty_jobs_title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              آگهی منطبق با فیلتر انتخابی یافت نشد. دکمه «اسکن فوری جابینجا و جاب‌ویژن» را بفشارید تا هوش مصنوعی آگهی‌های جدید را استخراج و تحلیل نماید.
            </p>
            <button
              onClick={() => runIranJob()}
              className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all inline-flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>اجرای فوری اسکن جمنای</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onFavoriteToggle={handleFavoriteToggle}
                onArchiveToggle={handleArchiveToggle}
                onSelect={setSelectedItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Email Preview Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-xl max-h-[85vh] rounded-3xl bg-white dark:bg-[#161622] border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    پیش‌نمایش ایمیل ارسالی به کاربر
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    گیرنده: <span className="font-mono text-indigo-600 dark:text-indigo-400">{userEmail}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyEmail}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all"
                  title="کپی متن گزارش"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? 'کپی شد' : 'کپی'}</span>
                </button>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Email Body Content */}
            <div className="p-5 overflow-y-auto no-scrollbar space-y-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  این گزارش هر روز راس ساعت ۰۸:۰۰ صبح به صورت خودکار با جمنای تولید و به صندوق ایمیل شما ارسال می‌گردد.
                </span>
              </div>

              {/* Email Envelope Header */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">گیرنده:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{userEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">فرستنده:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">رادار شغلی هوش مصنوعی جمنای</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">موضوع:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">گزارش روزانه موقعیت‌های پایتون و جنگو (جابینجا و جاب‌ویژن)</span>
                </div>
              </div>

              {/* Matched Jobs in Email */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  موقعیت‌های استخراج‌شده برای شما ({toPersianDigits(items.filter((i) => (i.job_meta?.match_score ?? 0) >= 80).length)} موقعیت):
                </h4>

                {items
                  .filter((i) => (i.job_meta?.match_score ?? 0) >= 80)
                  .slice(0, 4)
                  .map((job, idx) => (
                    <div
                      key={job.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-[#12121c] border border-slate-200 dark:border-white/10 space-y-2 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                            {toPersianDigits(idx + 1)}. {job.title}
                          </span>
                          <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {job.job_meta?.company} · {job.source_name}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">
                          {toPersianDigits(job.job_meta?.match_score || 0)}٪ تطابق
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {job.job_meta?.match_reason}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-white/5 text-[10px]">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <span>{job.job_meta?.location}</span>
                          {job.job_meta?.remote && <span className="text-emerald-600 dark:text-emerald-400 font-semibold">(دورکاری)</span>}
                        </div>

                        {job.source_url && (
                          <a
                            href={job.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>مشاهده مستقیم در منبع</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 dark:bg-[#12121c] border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                وضعیت ارسال: <span className="text-emerald-500 font-bold">ارسال موفق (Sent)</span>
              </span>
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all"
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
