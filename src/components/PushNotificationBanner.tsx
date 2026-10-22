import React, { useState } from 'react';
import { BellRing, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { requestPushPermission } from '../utils/pwa';
import { api } from '../api/client';
import { Pressable } from './ui';

export const PushNotificationBanner: React.FC = () => {
  const { lang, t, showToast } = useApp();
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleEnablePush = async () => {
    setIsSubscribing(true);
    try {
      const vapidRes = await api.getVapidPublicKey();
      const res = await requestPushPermission(vapidRes.publicKey);

      if (res.granted) {
        setPermission('granted');
        if (res.subscription) {
          await api.subscribePush(res.subscription.toJSON() as unknown as Record<string, unknown>);
        }
        showToast(
          lang === 'fa' ? 'اعلان‌های وب‌پوش با موفقیت فعال شد!' : 'Push notifications successfully activated!',
          'success'
        );
      } else {
        setPermission('denied');
        showToast(
          lang === 'fa'
            ? 'دسترسی ارسال اعلان داده نشد. می‌توانید از تنظیمات مرورگر آن را فعال کنید.'
            : 'Push notification permission was denied.',
          'warning'
        );
      }
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleTestPush = async () => {
    try {
      const res = await api.testPush();
      showToast(res.message, 'success');
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(t.app_title, {
          body:
            lang === 'fa'
              ? 'اعلان تست: ۵ آگهی شغلی جدید با تطابق بالای ۸۰٪ دریافت شد.'
              : 'Test alert: 5 high-match jobs received.',
          icon: '/pwa-192x192.png',
        });
      }
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  if (permission === 'granted') {
    return (
      <div className="ios-list mb-4 overflow-hidden">
        <div className="ios-list-row">
          <span
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
            style={{ background: 'var(--success-soft)', color: 'var(--success)' }}
            aria-hidden="true"
          >
            <Check className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="ios-row-title truncate">اعلان‌های وب‌پوش فعال است</p>
            <p className="ios-row-subtitle truncate">
              رادار شغل، دایجست و ابزارهای تلگرام روی گوشی ارسال می‌شوند.
            </p>
          </div>
          <Pressable
            onClick={handleTestPush}
            className="ios-btn ios-btn-secondary h-9 min-h-9 shrink-0 px-3 text-[12px]"
          >
            {t.test_push}
          </Pressable>
        </div>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div
        className="mb-4 flex items-start gap-2.5 rounded-[var(--r-card)] p-3.5"
        style={{ background: 'var(--danger-soft)' }}
      >
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]" strokeWidth={1.75} />
        <div>
          <p className="text-[13px] font-semibold text-[var(--text-primary)]">
            {lang === 'fa' ? 'دسترسی اعلان‌ها مسدود است' : 'Notifications Blocked'}
          </p>
          <p className="mt-0.5 text-[12px] leading-[1.7] text-[var(--text-secondary)]">
            {lang === 'fa'
              ? 'در تنظیمات آیفون > Safari یا تنظیمات نوتیفیکیشن سایت، اجازه ارسال اعلان را فعال کنید.'
              : 'In iOS Settings > Safari / Notifications, allow notifications for this app.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ios-list mb-4 overflow-hidden">
      <div className="ios-list-row">
        <span
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
          aria-hidden="true"
        >
          <BellRing className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="ios-row-title truncate">{t.push_title}</p>
          <p className="ios-row-subtitle line-clamp-1">{t.push_desc}</p>
        </div>
        <Pressable
          onClick={handleEnablePush}
          disabled={isSubscribing}
          className="ios-btn ios-btn-primary h-9 min-h-9 shrink-0 px-3 text-[12px] disabled:opacity-50"
        >
          {isSubscribing ? '...' : t.enable_push}
        </Pressable>
      </div>
    </div>
  );
};
