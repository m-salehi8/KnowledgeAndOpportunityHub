import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for PWA offline capabilities and Push Notifications
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('[PWA] New content available, refresh recommended');
    },
    onOfflineReady() {
      console.log('[PWA] App is ready to work offline');
    },
  });
}

createRoot(document.getElementById('root')!).render(<App />);
