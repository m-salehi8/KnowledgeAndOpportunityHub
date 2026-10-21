import React, { useState, useEffect } from 'react';
import { ProductHuntDailyDigest } from '../../types';
import { api } from '../../api/client';
import { initialProductHuntDigest } from '../../data/mockProductHunt';
import { useApp } from '../../context/AppContext';
import { toPersianDigits } from '../../utils/format';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProductHuntView: React.FC = () => {
  const { showToast } = useApp();
  const [digest, setDigest] = useState<ProductHuntDailyDigest>(initialProductHuntDigest);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'products' | 'spotlight' | 'ideas'>('all');

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
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#DA552F]/15 via-indigo-600/10 to-violet-600/10 dark:from-[#DA552F]/20 dark:via-indigo-900/20 dark:to-purple-900/10 border border-[#DA552F]/30 dark:border-[#DA552F]/20 p-5 md:p-7 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DA552F] text-white text-xs font-bold shadow-sm">
                <Rocket className="w-3.5 h-3.5" />
                <span>Product Hunt Daily Digest</span>
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-medium">
                {digest.date_formatted}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-medium">
                {toPersianDigits(digest.products.length)} محصول ارزیابی‌شده
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              دایجست روزانه برترین محصولات Product Hunt و ایده‌های نوآورانه
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              محصولات برتر لانچ‌شده در ۲۴ ساعت گذشته به همراه تحلیل عمیق اتوماسیون هوش مصنوعی و زوایای ایده‌پردازی برای بازار ایران و ساخت <bdi dir="ltr">Micro-SaaS</bdi>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#DA552F] hover:bg-[#c44926] text-white text-xs font-bold shadow-md shadow-[#DA552F]/20 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'در حال تحلیل...' : 'به‌روزرسانی دایجست ۲۴ ساعت'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-white/10">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSubTab === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5'
          }`}
        >
          گزارش کامل (همه بخش‌ها)
        </button>
        <button
          onClick={() => setActiveSubTab('products')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSubTab === 'products'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5'
          }`}
        >
          <Rocket className="w-3.5 h-3.5 text-[#DA552F]" />
          <span>محصولات برتر ({toPersianDigits(digest.products.length)})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('spotlight')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSubTab === 'spotlight'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>ویترین هوش مصنوعی و اتوماسیون</span>
        </button>
        <button
          onClick={() => setActiveSubTab('ideas')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSubTab === 'ideas'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>زوایای ایده و Micro-SaaS</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="space-y-8">
        {/* Section 1: Top Products */}
        {(activeSubTab === 'all' || activeSubTab === 'products') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Rocket className="w-5 h-5 text-[#DA552F]" />
                <span>۱. برترین محصولات روز (Top Products)</span>
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                مرتب‌شده بر اساس استقبال و نوآوری فنی
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {digest.products.map((product, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-2xl bg-white dark:bg-[#14141E] border border-slate-200 dark:border-white/10 p-5 shadow-sm hover:border-[#DA552F]/50 dark:hover:border-[#DA552F]/40 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#DA552F] transition-colors">
                            <bdi dir="ltr">{product.name}</bdi>
                          </h3>
                          {product.is_ai && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                              <Sparkles className="w-3 h-3" />
                              <span>AI Powered</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 leading-snug">
                          {product.tagline}
                        </p>
                      </div>

                      <a
                        href={product.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-[#DA552F]/15 dark:bg-white/5 dark:hover:bg-[#DA552F]/20 text-slate-600 dark:text-slate-300 hover:text-[#DA552F] shrink-0 transition-colors"
                        title="مشاهده در Product Hunt"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>

                    {/* Problem Solved */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>مشکلی که حل می‌کند:</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed pr-5" dangerouslySetInnerHTML={{ __html: product.problem_solved }} />
                    </div>

                    {/* Target Audience & Pricing */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">مخاطبان:</span>
                        <span>{product.target_audience}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <DollarSign className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">مدل قیمت‌گذاری:</span>
                        <span dangerouslySetInnerHTML={{ __html: product.pricing_model }} />
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-1.5">
                    {product.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-[11px] font-mono"
                      >
                        <bdi dir="ltr">#{tag}</bdi>
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Section 2: AI & Automation Spotlight */}
        {(activeSubTab === 'all' || activeSubTab === 'spotlight') && (
          <section className="space-y-3">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-500" />
              <span>۲. ذره‌بین هوش مصنوعی و اتوماسیون (AI & Automation Spotlight)</span>
            </h2>
            <div className="rounded-3xl bg-white dark:bg-[#14141E] border border-slate-200 dark:border-white/10 p-6 md:p-7 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <div
                className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-200"
                dangerouslySetInnerHTML={{ __html: digest.ai_spotlight }}
              />
            </div>
          </section>
        )}

        {/* Section 3: Idea Angle / Takeaways */}
        {(activeSubTab === 'all' || activeSubTab === 'ideas') && (
          <section className="space-y-3">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <span>۳. زاویه ایده و فرصت‌های ساخت Micro-SaaS (Idea Angle)</span>
            </h2>
            <div className="rounded-3xl bg-white dark:bg-[#14141E] border border-slate-200 dark:border-white/10 p-6 md:p-7 shadow-sm">
              <div
                className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-200"
                dangerouslySetInnerHTML={{ __html: digest.idea_takeaway }}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
