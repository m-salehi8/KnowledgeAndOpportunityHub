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
import { motion, useReducedMotion } from 'motion/react';
import { EmptyState, Pressable } from '../ui';

export const ProductHuntView: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { showToast } = useApp();
  const [digest, setDigest] = useState<ProductHuntDailyDigest>(initialProductHuntDigest);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'products' | 'spotlight' | 'ideas'>('all');
  const reduce = useReducedMotion();

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
    showToast('در حال اسکن محصولات برتر روز و تحلیل با هوش مصنوعی...', 'info');
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

  const subTabs: Array<{ id: 'all' | 'products' | 'spotlight' | 'ideas'; label: string; icon?: React.ComponentType<{ className?: string; strokeWidth?: number }> }> = [
    { id: 'all', label: 'گزارش کامل' },
    { id: 'products', label: 'محصولات برتر', icon: Rocket },
    { id: 'spotlight', label: 'ویترین هوش مصنوعی', icon: Sparkles },
    { id: 'ideas', label: 'زوایای ایده', icon: Lightbulb },
  ];

  return (
    <div className={embedded ? 'space-y-4' : 'space-y-4 px-4 pb-4'}>
      {/* Hero */}
      <section className="ios-card p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="ios-chip h-[24px] min-h-[24px] px-2.5 text-[11px]" data-tone="accent">
            <Rocket className="h-3 w-3" strokeWidth={1.75} />
            <span>Product Hunt Daily</span>
          </span>
          {digest.date_formatted && (
            <span className="ios-chip h-[24px] min-h-[24px] px-2.5 text-[11px]">
              {digest.date_formatted}
            </span>
          )}
          <span className="ios-chip h-[24px] min-h-[24px] px-2.5 text-[11px]" data-tone="success">
            <TrendingUp className="h-3 w-3" strokeWidth={1.75} />
            {toPersianDigits(digest.products.length)} محصول
          </span>
        </div>

        <h1 className="mt-3 text-[19px] font-bold leading-[1.6] text-[var(--text-primary)]">
          دایجست روزانه برترین محصولات Product Hunt و ایده‌های نوآورانه
        </h1>

        <p className="mt-1.5 text-[13px] leading-[1.7] text-[var(--text-secondary)]">
          محصولات برتر لانچ‌شده در ۲۴ ساعت گذشته به همراه تحلیل عمیق اتوماسیون هوش مصنوعی و زوایای
          ایده‌پردازی برای بازار ایران و ساخت <bdi dir="ltr">Micro-SaaS</bdi>.
        </p>

        <Pressable
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="ios-btn ios-btn-primary mt-4 h-11 w-full text-[14px] disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            strokeWidth={1.75}
          />
          <span>{isRefreshing ? 'در حال تحلیل...' : 'به‌روزرسانی دایجست ۲۴ ساعت'}</span>
        </Pressable>
      </section>

      {/* Sub tabs */}
      <div className="no-scrollbar snap-x flex items-center gap-2 overflow-x-auto pb-1">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Pressable
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className="snap-start shrink-0"
              aria-pressed={activeSubTab === tab.id}
            >
              <span className="ios-chip" data-active={activeSubTab === tab.id}>
                {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />}
                <span>{tab.label}</span>
              </span>
            </Pressable>
          );
        })}
      </div>

      <div className="space-y-5">
        {isEmpty ? (
          <div className="ios-card">
            <EmptyState
              icon={<PackageOpen className="h-7 w-7" strokeWidth={1.5} />}
              title="دایجست امروز هنوز آماده نیست"
              description="محصولات برتر ۲۴ ساعت گذشته هنوز دریافت نشده‌اند. برای اسکن و تحلیل دوباره، دکمه زیر را لمس کنید."
              action={
                <Pressable
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="ios-btn ios-btn-primary h-11 px-5 text-[15px] disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                    strokeWidth={1.75}
                  />
                  <span>دریافت مجدد دایجست</span>
                </Pressable>
              }
            />
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="ios-skeleton h-[148px] rounded-[var(--r-card)]" />
            ))}
          </div>
        ) : (
          <>
            {(activeSubTab === 'all' || activeSubTab === 'products') && (
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[var(--text-primary)]">
                  <Rocket className="h-4 w-4 text-[#DA552F]" strokeWidth={1.75} />
                  <span>برترین محصولات روز</span>
                </h2>

                <div className="grid grid-cols-1 gap-3">
                  {digest.products.map((product, idx) => (
                    <motion.div
                      key={idx}
                      initial={reduce ? undefined : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.22,
                        delay: reduce ? 0 : Math.min(idx, 8) * 0.04,
                        ease: [0.32, 0.72, 0, 1],
                      }}
                      className="ios-card p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
                              <bdi dir="ltr">{product.name}</bdi>
                            </h3>
                            {product.is_ai && (
                              <span className="ios-chip h-[22px] min-h-[22px] px-2 text-[10px]" data-tone="accent">
                                <Sparkles className="h-3 w-3" strokeWidth={1.75} />
                                <span>AI</span>
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[13px] font-medium leading-[1.6] text-[var(--text-secondary)]">
                            {product.tagline}
                          </p>
                        </div>

                        <a
                          href={product.url}
                          target="_blank"
                          rel="noreferrer"
                          className="ios-icon-button h-9 w-9 shrink-0"
                          aria-label="مشاهده در Product Hunt"
                        >
                          <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
                        </a>
                      </div>

                      <div className="mt-3 rounded-[var(--r-control)] bg-[var(--fill-quaternary)] p-3 text-[12px] leading-[1.7]">
                        <div className="mb-1 flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
                          <CheckCircle2
                            className="h-3.5 w-3.5 shrink-0 text-[var(--success)]"
                            strokeWidth={1.75}
                          />
                          <span>مشکلی که حل می‌کند:</span>
                        </div>
                        <p
                          className="ps-5 text-[var(--text-secondary)]"
                          dangerouslySetInnerHTML={{ __html: product.problem_solved }}
                        />
                      </div>

                      <div className="mt-2 space-y-1.5 text-[12px]">
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                          <Users className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" strokeWidth={1.75} />
                          <span className="font-semibold text-[var(--text-primary)]">مخاطبان:</span>
                          <span className="min-w-0 truncate">{product.target_audience}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                          <DollarSign
                            className="h-3.5 w-3.5 shrink-0 text-[var(--warning)]"
                            strokeWidth={1.75}
                          />
                          <span className="font-semibold text-[var(--text-primary)]">قیمت‌گذاری:</span>
                          <span className="min-w-0" dangerouslySetInnerHTML={{ __html: product.pricing_model }} />
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5 border-t-0.5px border-[var(--separator)] pt-3">
                        {product.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="ios-chip h-[24px] min-h-[24px] px-2 text-[10px]">
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
                <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[var(--text-primary)]">
                  <Cpu className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.75} />
                  <span>ذره‌بین هوش مصنوعی و اتوماسیون</span>
                </h2>
                <div className="ios-card p-4">
                  <div
                    className="ios-readable"
                    dangerouslySetInnerHTML={{ __html: digest.ai_spotlight }}
                  />
                </div>
              </section>
            )}

            {(activeSubTab === 'all' || activeSubTab === 'ideas') && (
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[var(--text-primary)]">
                  <TrendingUp className="h-4 w-4 text-[var(--success)]" strokeWidth={1.75} />
                  <span>زاویه ایده و فرصت‌های ساخت Micro-SaaS</span>
                </h2>
                <div className="ios-card p-4">
                  <div
                    className="ios-readable"
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
