// @ts-nocheck
import React, { useState } from 'react';
import { Smartphone, Share, PlusSquare, CheckCircle, X, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BottomSheet, Pressable } from './ui';

export const PWAInstallBanner: React.FC = () => {
  const { pwaState, lang, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (pwaState.isStandalone || isDismissed) {
    return null;
  }

  return (
    <>
      <div className="ios-list mb-4 overflow-hidden">
        <div className="ios-list-row">
          <span
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            aria-hidden="true"
          >
            <Smartphone className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="ios-row-title truncate">
              {lang === 'fa' ? 'نصب نسخه اختصاصی آیفون' : 'Install iOS PWA'}
            </p>
            <p className="ios-row-subtitle truncate">
              {lang === 'fa' ? 'تجربه تمام‌صفحه و اعلان لحظه‌ای' : 'Fullscreen + instant push'}
            </p>
          </div>

          <Pressable
            onClick={() => setIsOpen(true)}
            className="ios-btn ios-btn-secondary h-9 min-h-9 shrink-0 px-3 text-[13px]"
          >
            <span>{lang === 'fa' ? 'راهنما' : 'Guide'}</span>
          </Pressable>

          <Pressable
            onClick={() => setIsDismissed(true)}
            className="absolute end-2 top-2 h-8 w-8 rounded-full text-[var(--text-tertiary)]"
            aria-label="بستن راهنمای نصب"
          >
            <X className="mx-auto h-4 w-4" strokeWidth={1.75} />
          </Pressable>
        </div>
      </div>

      <BottomSheet
        open={isOpen}
        onClose={() => setIsOpen(false)}
        ariaLabel="راهنمای نصب اپلیکیشن"
        detents={[{ id: 'medium', ratio: 0.72 }]}
        header={
          <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-2">
            <div className="flex items-center gap-2.5">
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-[10px]"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                aria-hidden="true"
              >
                <Smartphone className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
              <h2 className="text-[17px] font-semibold text-[var(--text-primary)]">
                {t.pwa_install_title}
              </h2>
            </div>
            <Pressable
              onClick={() => setIsOpen(false)}
              className="ios-icon-button h-9 w-9"
              aria-label="بستن"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </Pressable>
          </div>
        }
        footer={
          <Pressable
            onClick={() => setIsOpen(false)}
            className="ios-btn ios-btn-primary w-full text-[15px]"
          >
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            <span>{lang === 'fa' ? 'متوجه شدم' : 'Got it'}</span>
          </Pressable>
        }
      >
        <div className="px-4 pb-6">
          <p className="mb-4 text-[13px] leading-[1.7] text-[var(--text-secondary)]">
            {lang === 'fa'
              ? 'برای تجربه کامل کاربری، اعلان‌های وب‌پوش، اجرای تمام‌صفحه و سرعت لود فوری بدون نوار ابزار مرورگر:'
              : 'For the native fullscreen experience, offline caching, and instant web push notifications:'}
          </p>

          <div className="space-y-2.5">
            {[
              {
                icon: Share,
                title: lang === 'fa' ? 'مرحله اول' : 'Step 1',
                text: t.pwa_install_ios_step1,
                tone: 'var(--accent)',
              },
              {
                icon: PlusSquare,
                title: lang === 'fa' ? 'مرحله دوم' : 'Step 2',
                text: t.pwa_install_ios_step2,
                tone: 'var(--info)',
              },
              {
                icon: CheckCircle,
                title: lang === 'fa' ? 'مرحله سوم' : 'Step 3',
                text: t.pwa_install_ios_step3,
                tone: 'var(--success)',
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="ios-list-row rounded-[var(--r-control)] bg-[var(--fill-quaternary)]">
                  <span
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]"
                    style={{ background: 'var(--grouped-card)', color: step.tone }}
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <p className="ios-row-title">{step.title}</p>
                    <p className="ios-row-subtitle leading-[1.6]">{step.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </BottomSheet>
    </>
  );
};
