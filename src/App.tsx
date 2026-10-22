import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AppProvider, useApp, TabType } from './context/AppContext';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { ItemDetailModal } from './components/ItemDetailModal';
import { InboxView } from './components/views/InboxView';
import { JobsRadarView } from './components/views/JobsRadarView';
import { SearchView } from './components/views/SearchView';
import { SavedView } from './components/views/SavedView';
import { SettingsView } from './components/views/SettingsView';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

const ToastStack: React.FC = () => {
  const { toasts } = useApp();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[90] mx-auto flex w-full max-w-[430px] flex-col items-center gap-2 px-4 pt-safe">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="ios-glass pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-[16px] px-4 py-3 text-[13px] font-medium text-[var(--text-primary)]"
          >
            {toast.type === 'success' && (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--success)]" strokeWidth={1.75} />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="h-4 w-4 shrink-0 text-[var(--danger)]" strokeWidth={1.75} />
            )}
            {toast.type === 'warning' && (
              <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--warning)]" strokeWidth={1.75} />
            )}
            {toast.type === 'info' && (
              <Info className="h-4 w-4 shrink-0 text-[var(--accent)]" strokeWidth={1.75} />
            )}
            <span className="leading-[1.6]">{toast.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const Splash: React.FC<{ visible: boolean }> = ({ visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        className="ios-splash"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
      >
        <motion.div
          className="ios-splash-mark"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        >
          <Sparkles className="h-9 w-9 text-white" strokeWidth={1.75} />
        </motion.div>
        <p className="ios-splash-title">هاب دانش و فرصت‌ها</p>
      </motion.div>
    )}
  </AnimatePresence>
);

const AppContent: React.FC = () => {
  const { activeTab, selectedItem, setSelectedItem, triggerReload } = useApp();
  const [screenOrigin, setScreenOrigin] = useState('center center');
  const [splashVisible, setSplashVisible] = useState(true);
  const [direction, setDirection] = useState(1);
  const previousTab = useRef<TabType>(activeTab);
  const reduce = useReducedMotion();

  const TAB_ORDER: TabType[] = ['inbox', 'jobs', 'search', 'saved', 'settings'];

  useEffect(() => {
    const timer = setTimeout(() => setSplashVisible(false), 620);
    return () => clearTimeout(timer);
  }, []);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'inbox':
        return <InboxView />;
      case 'jobs':
        return <JobsRadarView />;
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
    const from = TAB_ORDER.indexOf(previousTab.current);
    const to = TAB_ORDER.indexOf(activeTab);
    setDirection(to >= from ? 1 : -1);
    previousTab.current = activeTab;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeTab]);

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
      <div className="app-bg" aria-hidden="true" />
      <ToastStack />
      <Splash visible={splashVisible} />

      <div className="app-frame">
        <div
          className="app-screen"
          style={{
            transform: selectedItem ? 'translateY(8px) scale(0.96)' : 'none',
            borderRadius: selectedItem ? 28 : 0,
            transformOrigin: screenOrigin,
            overflow: selectedItem ? 'hidden' : 'visible',
            transition:
              'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          <Header />

          <main
            className="scroll-pad relative z-10 w-full pt-1"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: direction * 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: direction * -12 }}
                transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
              >
                {renderActiveView()}
              </motion.div>
            </AnimatePresence>
          </main>
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
