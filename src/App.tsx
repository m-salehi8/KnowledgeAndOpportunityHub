import React, { useEffect, useLayoutEffect, useState } from 'react';
import { AppProvider, useApp, TabType } from './context/AppContext';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { ItemDetailModal } from './components/ItemDetailModal';
import { InboxView } from './components/views/InboxView';
import { JobsRadarView } from './components/views/JobsRadarView';
import { ProductHuntView } from './components/views/ProductHuntView';
import { ProjectsView } from './components/views/ProjectsView';
import { SearchView } from './components/views/SearchView';
import { SavedView } from './components/views/SavedView';
import { SettingsView } from './components/views/SettingsView';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ORB_GRADIENTS: Record<TabType, string> = {
  inbox:
    'radial-gradient(circle at 40% 35%, rgba(236,72,153,0.52), rgba(99,102,241,0.2) 55%, transparent 72%)',
  jobs: 'radial-gradient(circle at 40% 35%, rgba(16,185,129,0.5), rgba(6,182,212,0.18) 55%, transparent 72%)',
  producthunt:
    'radial-gradient(circle at 40% 35%, rgba(218,85,47,0.46), rgba(244,114,182,0.16) 55%, transparent 72%)',
  projects:
    'radial-gradient(circle at 40% 35%, rgba(56,189,248,0.46), rgba(99,102,241,0.2) 55%, transparent 72%)',
  search:
    'radial-gradient(circle at 40% 35%, rgba(139,92,246,0.46), rgba(34,211,238,0.16) 55%, transparent 72%)',
  saved:
    'radial-gradient(circle at 40% 35%, rgba(251,191,36,0.4), rgba(236,72,153,0.14) 55%, transparent 72%)',
  settings:
    'radial-gradient(circle at 40% 35%, rgba(100,116,139,0.4), rgba(56,189,248,0.12) 55%, transparent 72%)',
};

const RefractionFilter: React.FC = () => (
  <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
    <defs>
      <filter id="ios-liquid-glass" x="-10%" y="-10%" width="120%" height="120%" filterUnits="objectBoundingBox">
        <feTurbulence type="fractalNoise" baseFrequency="0.015 0.015" numOctaves="1" seed="7" result="noise" />
        <feGaussianBlur in="noise" stdDeviation="2.5" result="softNoise" />
        <feDisplacementMap in="SourceGraphic" in2="softNoise" scale="12" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
);

const AmbientBackground: React.FC<{ tab: TabType }> = ({ tab }) => (
  <div className="app-ambient" aria-hidden="true">
    <AnimatePresence mode="sync">
      <motion.div
        key={tab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.34 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="ambient-orb"
        style={{
          top: '-110px',
          right: '-80px',
          width: 330,
          height: 330,
          background: ORB_GRADIENTS[tab],
        }}
      />
    </AnimatePresence>

    <div
      className="ambient-orb orb-a"
      style={{
        top: '34%',
        left: '-130px',
        width: 300,
        height: 300,
        background:
          'radial-gradient(circle, rgba(6,182,212,0.34), rgba(14,116,144,0.08) 60%, transparent 72%)',
      }}
    />
    <div
      className="ambient-orb orb-b"
      style={{
        bottom: '12%',
        right: '-90px',
        width: 280,
        height: 280,
        background:
          'radial-gradient(circle, rgba(34,211,238,0.24), rgba(99,102,241,0.12) 58%, transparent 72%)',
      }}
    />
    <div
      className="absolute inset-x-0 bottom-0 h-56"
      style={{
        background:
          'radial-gradient(ellipse at 50% 100%, rgba(34,211,238,0.22), transparent 68%)',
        filter: 'blur(46px)',
      }}
    />
  </div>
);

const ToastStack: React.FC = () => {
  const { toasts } = useApp();

  return (
    <div className="fixed top-0 left-1/2 z-[70] flex w-full max-w-[430px] -translate-x-1/2 flex-col items-center gap-2 px-4 pt-safe pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -18, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="ios-glass-card pointer-events-auto flex w-full max-w-sm items-center gap-2.5 px-4 py-3 text-[11px] font-medium text-slate-900 dark:text-white"
            style={{ borderRadius: 22 }}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />}
            {toast.type === 'info' && <Info className="w-4 h-4 shrink-0 text-cyan-500" />}
            <span className="leading-snug">{toast.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { activeTab, selectedItem, setSelectedItem, triggerReload, theme } = useApp();
  const [screenOrigin, setScreenOrigin] = useState('center center');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'inbox':
        return <InboxView />;
      case 'jobs':
        return <JobsRadarView />;
      case 'producthunt':
        return <ProductHuntView />;
      case 'projects':
        return <ProjectsView />;
      case 'search':
        return <SearchView />;
      case 'saved':
        return <SavedView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <InboxView />;
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#03070E' : '#EAF0F9');
    }
  }, [theme]);

  useLayoutEffect(() => {
    if (selectedItem) {
      setScreenOrigin(`center ${window.scrollY + window.innerHeight / 2}px`);
    }
  }, [selectedItem]);

  useEffect(() => {
    document.body.style.overflow = selectedItem ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedItem]);

  return (
    <div className="app-viewport">
      <RefractionFilter />
      <AmbientBackground tab={activeTab} />
      <ToastStack />

      <div className="app-frame">
        <div
          className="app-screen"
          style={{
            transform: selectedItem ? 'translateY(7px) scale(0.955)' : 'none',
            borderRadius: selectedItem ? 36 : 0,
            transformOrigin: screenOrigin,
            overflow: selectedItem ? 'hidden' : 'visible',
            transition:
              'transform 0.42s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.42s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          <Header />

          <main className="relative z-10 w-full pt-1 scroll-pad">{renderActiveView()}</main>
        </div>

        <TabBar detailOpen={Boolean(selectedItem)} />
      </div>

      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onUpdate={(updated) => {
          setSelectedItem(updated);
          triggerReload();
        }}
        onDelete={() => {
          setSelectedItem(null);
          triggerReload();
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
