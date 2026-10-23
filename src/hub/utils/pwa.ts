// @ts-nocheck
export interface PWAState {
  isStandalone: boolean;
  isIOS: boolean;
  isSafari: boolean;
  canInstall: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
}

export function detectPWA(): PWAState {
  if (typeof window === 'undefined') {
    return {
      isStandalone: false,
      isIOS: false,
      isSafari: false,
      canInstall: false,
      notificationPermission: 'unsupported',
    };
  }

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://');

  const ua = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isSafari = isIOS && /webkit/.test(ua) && !/crios|fxios|opios/.test(ua);

  const notificationPermission =
    'Notification' in window ? Notification.permission : 'unsupported';

  return {
    isStandalone,
    isIOS,
    isSafari,
    canInstall: false,
    notificationPermission,
  };
}

export async function requestPushPermission(vapidPublicKey?: string): Promise<{
  granted: boolean;
  subscription?: PushSubscription;
  error?: string;
}> {
  if (!('Notification' in window)) {
    return { granted: false, error: 'Push notifications are not supported by this browser.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { granted: false, error: 'Notification permission was denied.' };
    }

    if (!('serviceWorker' in navigator) || !vapidPublicKey) {
      return { granted: true };
    }

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as unknown as BufferSource,
      });
    }

    return { granted: true, subscription: sub };
  } catch (err) {
    return { granted: false, error: (err as Error).message };
  }
}

export function setAppBadge(count: number): void {
  if ('setAppBadge' in navigator) {
    if (count > 0) {
      (navigator as unknown as { setAppBadge: (c: number) => Promise<void> }).setAppBadge(count).catch(() => {});
    } else {
      (navigator as unknown as { clearAppBadge: () => Promise<void> }).clearAppBadge().catch(() => {});
    }
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
