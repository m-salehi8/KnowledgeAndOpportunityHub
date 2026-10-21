import React, { useState } from 'react';
import { Smartphone, Share, PlusSquare, CheckCircle, X } from 'lucide-react';
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
      {/* Compact Top Banner if not installed */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50/70 to-slate-100 dark:from-indigo-950/80 dark:via-purple-950/80 dark:to-slate-900 border-b border-indigo-200 dark:border-indigo-500/20 px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
          <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-semibold truncate max-w-[240px]">
            {lang === 'fa' ? 'نصب نسخه اختصاصی PWA برای آیفون و موبایل' : 'Install PWA for iOS & Mobile'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow-sm active:scale-95 transition-all"
          >
            {lang === 'fa' ? 'راهنمای نصب' : 'Install Guide'}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* iOS Step-by-Step Modal Walkthrough */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#12121A] border border-slate-200 dark:border-white/10 p-5 text-slate-800 dark:text-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.pwa_install_title}</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {lang === 'fa'
                ? 'برای تجربه کامل کاربری، اعلان‌های وب‌پوش، اجرای تمام‌صفحه و سرعت لود فوری بدون نوار ابزار مرورگر:'
                : 'For the native fullscreen experience, offline caching, and instant web push notifications:'}
            </p>

            <div className="space-y-3 text-xs bg-slate-50 dark:bg-black/40 p-3.5 rounded-2xl border border-slate-200 dark:border-white/5">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Share className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                    {lang === 'fa' ? 'مرحله اول' : 'Step 1'}
                  </span>
                  <span className="text-slate-600 dark:text-slate-300 leading-snug">{t.pwa_install_ios_step1}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <PlusSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                    {lang === 'fa' ? 'مرحله دوم' : 'Step 2'}
                  </span>
                  <span className="text-slate-600 dark:text-slate-300 leading-snug">{t.pwa_install_ios_step2}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                    {lang === 'fa' ? 'مرحله سوم' : 'Step 3'}
                  </span>
                  <span className="text-slate-600 dark:text-slate-300 leading-snug">{t.pwa_install_ios_step3}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 active:scale-98 transition-all"
            >
              {lang === 'fa' ? 'متوجه شدم' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
