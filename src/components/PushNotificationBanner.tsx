import React, { useState } from 'react';
import { BellRing, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { requestPushPermission } from '../utils/pwa';
import { api } from '../api/client';

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
      <div className="ios-glass-card flex items-center justify-between gap-3 p-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-300/25 bg-emerald-400/12 text-emerald-200">
            <Check className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[10.5px] font-bold text-slate-900 dark:text-white">اعلان‌های وب‌پوش فعال است</h4>
            <p className="truncate text-[9.5px] text-slate-500 dark:text-slate-400">
              رادار شغل، دایجست و ابزارهای تلگرام روی گوشی ارسال می‌شوند.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleTestPush}
          className="ios-glass-pill shrink-0 px-2.5 py-1.5 text-[9.5px] font-bold text-emerald-100"
        >
          {t.test_push}
        </button>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="ios-glass-card flex items-start gap-2.5 border-rose-300/20 p-3.5">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
        <div>
          <h4 className="mb-0.5 text-[10.5px] font-bold text-slate-900 dark:text-white">
            {lang === 'fa' ? 'دسترسی اعلان‌ها مسدود است' : 'Notifications Blocked'}
          </h4>
          <p className="text-[9.5px] leading-snug text-slate-500 dark:text-slate-300">
            {lang === 'fa'
              ? 'در تنظیمات آیفون > Safari یا تنظیمات نوتیفیکیشن سایت، اجازه ارسال اعلان را فعال کنید.'
              : 'In iOS Settings > Safari / Notifications, allow notifications for this app.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ios-glass-card ios-specular flex items-center justify-between gap-3 p-3.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-400/12 text-cyan-200">
          <BellRing className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h4 className="text-[10.5px] font-bold text-slate-900 dark:text-white">{t.push_title}</h4>
          <p className="line-clamp-1 text-[9.5px] text-slate-500 dark:text-slate-300">{t.push_desc}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleEnablePush}
        disabled={isSubscribing}
        className="ios-press shrink-0 rounded-full border border-cyan-300/35 bg-cyan-400/20 px-3 py-2 text-[10px] font-bold text-cyan-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] disabled:opacity-50"
      >
        {isSubscribing ? '...' : t.enable_push}
      </button>
    </div>
  );
};
