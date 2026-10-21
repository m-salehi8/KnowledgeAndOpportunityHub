import React, { useState } from 'react';
import { BellRing, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { requestPushPermission } from '../utils/pwa';
import { api } from '../api/client';

export const PushNotificationBanner: React.FC = () => {
  const { lang, t, showToast } = useApp();
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default';
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
          lang === 'fa'
            ? 'اعلان‌های وب‌پوش با موفقیت فعال شد!'
            : 'Push notifications successfully activated!',
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
          body: lang === 'fa' ? 'اعلان تست: ۵ آگهی شغلی جدید با تطابق بالای ۸۰٪ دریافت شد.' : 'Test alert: 5 high-match jobs received.',
          icon: '/pwa-192x192.png',
        });
      }
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  if (permission === 'granted') {
    return (
      <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.push_active}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'fa' ? 'به‌روزرسانی‌های تلگرام و رادار شغل ارسال می‌شوند.' : 'Telegram & Job radar alerts are on.'}
            </p>
          </div>
        </div>
        <button
          onClick={handleTestPush}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-indigo-600 dark:text-indigo-300 text-xs font-semibold active:scale-95 transition-all border border-indigo-200 dark:border-transparent shadow-sm"
        >
          {t.test_push}
        </button>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 flex items-start gap-3 text-xs shadow-sm">
        <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-0.5">
            {lang === 'fa' ? 'دسترسی اعلان‌ها مسدود است' : 'Notifications Blocked'}
          </h4>
          <p className="text-slate-600 dark:text-slate-300 leading-snug">
            {lang === 'fa'
              ? 'در تنظیمات آیفون > Safari > Advanced یا تنظیمات نوتیفیکیشن سایت، اجازه ارسال اعلان را فعال کنید.'
              : 'In iOS Settings > Safari / Notifications, allow notifications for this installed web app.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50/60 to-white dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-500/30 flex items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 dark:bg-indigo-600/30 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
          <BellRing className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t.push_title}</h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">{t.push_desc}</p>
        </div>
      </div>
      <button
        onClick={handleEnablePush}
        disabled={isSubscribing}
        className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shrink-0 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
      >
        {isSubscribing ? '...' : t.enable_push}
      </button>
    </div>
  );
};
