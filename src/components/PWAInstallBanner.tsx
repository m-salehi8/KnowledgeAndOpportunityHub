import React, { useState } from 'react';
import { Smartphone, Share, PlusSquare, CheckCircle, X, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PWAInstallBanner: React.FC = () => {
  const { pwaState, lang, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (pwaState.isStandalone || isDismissed) {
    return null;
  }

  return (
    <>
      <div className="px-4">
        <div className="ios-glass-card ios-specular flex items-center justify-between gap-2 p-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-400/12 text-cyan-200">
              <Smartphone className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10.5px] font-bold text-slate-900 dark:text-white">
                {lang === 'fa' ? 'نصب نسخه اختصاصی آیفون' : 'Install iOS PWA'}
              </p>
              <p className="truncate text-[9px] text-slate-500 dark:text-slate-400">
                {lang === 'fa' ? 'تجربه تمام‌صفحه و اعلان لحظه‌ای' : 'Fullscreen + instant push'}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="ios-glass-pill px-2.5 py-1.5 text-[9.5px] font-bold text-cyan-100"
            >
              {lang === 'fa' ? 'راهنما' : 'Guide'}
            </button>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="rounded-full p-1.5 text-slate-500 transition-colors hover:text-slate-200"
              title="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />

          <div className="ios-glass-sheet relative w-full max-w-[430px] rounded-t-[38px] px-5 pb-safe text-slate-800 dark:text-slate-200">
            <div className="ios-grabber" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-cyan-500/30 to-indigo-500/30 text-cyan-100">
                  <Smartphone className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.pwa_install_title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="ios-icon-button h-8 w-8"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              {lang === 'fa'
                ? 'برای تجربه کامل کاربری، اعلان‌های وب‌پوش، اجرای تمام‌صفحه و سرعت لود فوری بدون نوار ابزار مرورگر:'
                : 'For the native fullscreen experience, offline caching, and instant web push notifications:'}
            </p>

            <div className="mt-3 space-y-2.5">
              {[
                {
                  icon: Share,
                  title: lang === 'fa' ? 'مرحله اول' : 'Step 1',
                  text: t.pwa_install_ios_step1,
                  tone: 'text-cyan-200 border-cyan-300/25 bg-cyan-400/10',
                },
                {
                  icon: PlusSquare,
                  title: lang === 'fa' ? 'مرحله دوم' : 'Step 2',
                  text: t.pwa_install_ios_step2,
                  tone: 'text-indigo-200 border-indigo-300/25 bg-indigo-400/10',
                },
                {
                  icon: CheckCircle,
                  title: lang === 'fa' ? 'مرحله سوم' : 'Step 3',
                  text: t.pwa_install_ios_step3,
                  tone: 'text-emerald-200 border-emerald-300/25 bg-emerald-400/10',
                },
              ].map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="ios-glass-subtile flex items-start gap-2.5 p-3">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border ${step.tone}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="mb-0.5 block text-[10px] font-bold text-slate-900 dark:text-white">
                        {step.title}
                      </span>
                      <span className="text-[10px] leading-snug text-slate-600 dark:text-slate-300">
                        {step.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="ios-press mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-cyan-300/35 bg-gradient-to-r from-cyan-500/80 to-indigo-500/80 text-[11px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_26px_-10px_rgba(34,211,238,0.7)]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{lang === 'fa' ? 'متوجه شدم' : 'Got it'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
