import React, { useState, useEffect } from 'react';
import { ProductHuntDailyDigest } from '../../types';
import { api } from '../../api/client';
import { initialProductHuntDigest } from '../../data/mockProductHunt';
import { useApp } from '../../context/AppContext';
import { normalizeTag, toPersianDigits } from '../../utils/format';
import {
  Rocket,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Cpu,
  Lightbulb,
  Tag,
  DollarSign,
  Users,
  CheckCircle2,
  TrendingUp,
  PackageOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProductHuntView: React.FC = () => {
  const { showToast } = useApp();
  const [digest, setDigest] = useState<ProductHuntDailyDigest>(initialProductHuntDigest);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'products' | 'spotlight' | 'ideas'>('all');

  const isEmpty = !isLoading && digest.products.length === 0;

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    api
      .getProductHuntDaily()
      .then((data) => {
        if (isMounted && data) {
          setDigest(data);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch daily PH digest:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    showToast('در حال اسکن ۵ تا ۱۰ محصول برتر روز از Product Hunt و تحلیل با هوش مصنوعی...', 'info');
    try {
      const res = await api.refreshProductHuntDaily();
      if (res.digest) {
        setDigest(res.digest);
        showToast(res.message, 'success');
      }
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-4 px-4 pb-4">
      <div className="ios-glass-card ios-specular relative overflow-hidden p-[18px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -start-16 h-64 w-64 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(218,85,47,0.38), rgba(244,63,94,0.16) 55%, transparent 72%)',
            filter: 'blur(28px)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -end-14 h-52 w-52 rounded-full opacity-70"
          style={{
            background:
              'radial-gradient(circle, rgba(45,212,191,0.32), rgba(34,211,238,0.14) 58%, transparent 74%)',
            filter: 'blur(26px)',
          }}
        />

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="ios-glass-pill inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-[#DA552F] dark:text-[#fb923c]">
              <Rocket className="h-3.5 w-3.5" />
              <span>Product Hunt Daily Digest</span>
            </span>
            {digest.date_formatted && (
              <span className="ios-glass-pill px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                {digest.date_formatted}
              </span>
            )}
            <span className="ios-glass-pill inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-cyan-700 dark:text-cyan-200">
              <TrendingUp className="h-3 w-3" />
              {toPersianDigits(digest.products.length)} محصول ارزیابی‌شده
            </span>
          </div>

          <h1 className="ios-glass-text text-xl font-black leading-tight">
            دایجست روزانه برترین محصولات Product Hunt و ایده‌های نوآورانه
          </h1>

          <p className="max-w-2xl text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
            محصولات برتر لانچ‌شده در ۲۴ ساعت گذشته به همراه تحلیل عمیق اتوماسیون هوش مصنوعی و زوایای ایده‌پردازی برای بازار ایران و ساخت <bdi dir="ltr">Micro-SaaS</bdi>.
          </p>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="ios-press flex h-10 w-full items-center justify-center gap-2 rounded-full border border-orange-300/40 bg-gradient-to-r from-[#DA552F] via-[#e4613a] to-rose-500 px-4 text-[11px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_22px_-8px_rgba(218,85,47,0.75)] transition-all disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'در حال تحلیل...' : 'به‌روزرسانی دایجست ۲۴ ساعت'}</span>
          </button>
        </div>
      </div>

      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`ios-press shrink-0 px-3 py-2 text-[11px] font-semibold transition-all ${
            activeSubTab === 'all'
              ? 'ios-glass-pill-active'
              : 'ios-glass-pill text-slate-600 dark:text-slate-300'
          }`}
        >
          گزارش کامل (همه بخش‌ها)
        </button>
        <button
          onClick={() => setActiveSubTab('products')}
          className={`ios-press flex shrink-0 items-center gap-1.5 px-3 py-2 text-[11px] font-semibold transition-all ${
            activeSubTab === 'products'
              ? 'ios-glass-pill-active'
              : 'ios-glass-pill text-slate-600 dark:text-slate-300'
          }`}
        >
          <Rocket className="h-3.5 w-3.5 text-[#DA552F] dark:text-[#fb923c]" />
          <span>محصولات برتر ({toPersianDigits(digest.products.length)})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('spotlight')}
          className={`ios-press flex shrink-0 items-center gap-1.5 px-3 py-2 text-[11px] font-semibold transition-all ${
            activeSubTab === 'spotlight'
              ? 'ios-glass-pill-active'
              : 'ios-glass-pill text-slate-600 dark:text-slate-300'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-300" />
          <span>ویترین هوش مصنوعی و اتوماسیون</span>
        </button>
        <button
          onClick={() => setActiveSubTab('ideas')}
          className={`ios-press flex shrink-0 items-center gap-1.5 px-3 py-2 text-[11px] font-semibold transition-all ${
            activeSubTab === 'ideas'
              ? 'ios-glass-pill-active'
              : 'ios-glass-pill text-slate-600 dark:text-slate-300'
          }`}
        >
          <Lightbulb className="h-3.5 w-3.5 text-amber-500 dark:text-amber-300" />
          <span>زوایای ایده و Micro-SaaS</span>
        </button>
      </div>

      <div className="space-y-5">
        {isEmpty ? (
          <div className="ios-glass-card ios-specular px-6 py-10 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-[20px] border border-orange-300/25 bg-orange-400/10 text-[#DA552F] dark:text-[#fb923c]">
              <PackageOpen className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              دایجست امروز هنوز آماده نیست
            </h3>
            <p className="mx-auto mt-1.5 max-w-xs text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400">
              محصولات برتر ۲۴ ساعت گذشته هنوز دریافت نشده‌اند. برای اسکن و تحلیل دوباره، دکمه زیر را لمس کنید.
            </p>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="ios-press mx-auto mt-4 flex h-10 items-center justify-center gap-2 rounded-full border border-orange-300/40 bg-gradient-to-r from-[#DA552F] via-[#e4613a] to-rose-500 px-4 text-[11px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_22px_-8px_rgba(218,85,47,0.75)] disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'در حال تحلیل...' : 'دریافت مجدد دایجست ۲۴ ساعت'}</span>
            </button>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="ios-glass-card ios-skeleton h-[148px] rounded-[26px]" />
            ))}
          </div>
        ) : (
          <>
        {(activeSubTab === 'all' || activeSubTab === 'products') && (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                <Rocket className="h-4.5 w-4.5 text-[#DA552F] dark:text-[#fb923c]" />
                <span>۱. برترین محصولات روز (Top Products)</span>
              </h2>
              <span className="shrink-0 text-[9.5px] text-slate-500 dark:text-slate-400">
                مرتب‌شده بر اساس استقبال و نوآوری فنی
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {digest.products.map((product, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="ios-glass-card ios-press group flex flex-col justify-between p-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-[#DA552F] dark:text-white dark:group-hover:text-[#fb923c]">
                            <bdi dir="ltr">{product.name}</bdi>
                          </h3>
                          {product.is_ai && (
                            <span className="ios-glass-pill inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold text-indigo-700 dark:text-indigo-200">
                              <Sparkles className="h-3 w-3" />
                              <span>AI Powered</span>
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs font-semibold leading-snug text-slate-700 dark:text-slate-300">
                          {product.tagline}
                        </p>
                      </div>

                      <a
                        href={product.url}
                        target="_blank"
                        rel="noreferrer"
                        className="ios-icon-button h-8 w-8 shrink-0 text-slate-600 transition-colors hover:text-[#DA552F] dark:text-slate-200 dark:hover:text-[#fb923c]"
                        title="مشاهده در Product Hunt"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>

                    <div className="ios-glass-subtile space-y-1.5 p-3 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500 dark:text-emerald-300" />
                        <span>مشکلی که حل می‌کند:</span>
                      </div>
                      <p className="pe-5 leading-relaxed text-slate-600 dark:text-slate-400" dangerouslySetInnerHTML={{ __html: product.problem_solved }} />
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="ios-glass-subtile flex items-center gap-1.5 p-2.5 text-slate-600 dark:text-slate-400">
                        <Users className="h-3.5 w-3.5 shrink-0 text-indigo-500 dark:text-indigo-300" />
                        <span className="font-semibold text-slate-700 dark:text-slate-200">مخاطبان:</span>
                        <span className="min-w-0 truncate">{product.target_audience}</span>
                      </div>
                      <div className="ios-glass-subtile flex items-center gap-1.5 p-2.5 text-slate-600 dark:text-slate-400">
                        <DollarSign className="h-3.5 w-3.5 shrink-0 text-amber-500 dark:text-amber-300" />
                        <span className="font-semibold text-slate-700 dark:text-slate-200">مدل قیمت‌گذاری:</span>
                        <span className="min-w-0" dangerouslySetInnerHTML={{ __html: product.pricing_model }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-200/60 pt-3 dark:border-white/[0.07]">
                    {product.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="rounded-full border border-slate-200/70 bg-white/60 px-2.5 py-1 text-[10px] font-mono text-slate-600 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300"
                      >
                        <bdi dir="ltr">#{normalizeTag(tag)}</bdi>
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {(activeSubTab === 'all' || activeSubTab === 'spotlight') && (
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
              <Cpu className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-300" />
              <span>۲. ذره‌بین هوش مصنوعی و اتوماسیون (AI & Automation Spotlight)</span>
            </h2>
            <div className="ios-glass-card ios-specular relative overflow-hidden p-2">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 -end-10 h-40 w-40 rounded-full opacity-60"
                style={{
                  background:
                    'radial-gradient(circle, rgba(99,102,241,0.28), transparent 70%)',
                  filter: 'blur(22px)',
                }}
              />
              <div
                className="ios-reader prose dark:prose-invert relative z-10 max-w-none rounded-[24px] p-4 text-slate-700 dark:text-slate-200"
                dangerouslySetInnerHTML={{ __html: digest.ai_spotlight }}
              />
            </div>
          </section>
        )}

        {(activeSubTab === 'all' || activeSubTab === 'ideas') && (
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-500 dark:text-emerald-300" />
              <span>۳. زاویه ایده و فرصت‌های ساخت Micro-SaaS (Idea Angle)</span>
            </h2>
            <div className="ios-glass-card ios-specular relative overflow-hidden p-2">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-16 -start-10 h-40 w-40 rounded-full opacity-60"
                style={{
                  background:
                    'radial-gradient(circle, rgba(16,185,129,0.26), transparent 70%)',
                  filter: 'blur(22px)',
                }}
              />
              <div
                className="ios-reader prose dark:prose-invert relative z-10 max-w-none rounded-[24px] p-4 text-slate-700 dark:text-slate-200"
                dangerouslySetInnerHTML={{ __html: digest.idea_takeaway }}
              />
            </div>
          </section>
        )}
          </>
        )}
      </div>
    </div>
  );
};
