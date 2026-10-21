import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Item, HubStats, AppSettings } from '../types';
import { translations, Language } from '../utils/i18n';
import { api } from '../api/client';
import { detectPWA, PWAState } from '../utils/pwa';

export type TabType = 'inbox' | 'jobs' | 'projects' | 'search' | 'saved' | 'settings';

interface ToastMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface AppContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: typeof translations['fa'];
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedItem: Item | null;
  setSelectedItem: (item: Item | null) => void;
  stats: HubStats | null;
  refreshStats: () => Promise<void>;
  toasts: ToastMessage[];
  showToast: (text: string, type?: ToastMessage['type']) => void;
  pwaState: PWAState;
  reloadTrigger: number;
  triggerReload: () => void;
  runJob: (jobType: 'news' | 'jobs') => Promise<void>;
  runIranJob: () => Promise<void>;
  isRunningJob: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('fa');
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [stats, setStats] = useState<HubStats | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [pwaState, setPwaState] = useState<PWAState>(() => detectPWA());
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [isRunningJob, setIsRunningJob] = useState(false);

  const t = translations.fa;

  // Sync lang & dir - strictly Persian as requested
  const setLang = useCallback((_newLang: Language = 'fa') => {
    setLangState('fa');
    document.documentElement.lang = 'fa';
    document.documentElement.dir = 'rtl';
    try {
      localStorage.setItem('hub_lang', 'fa');
    } catch {
      // ignore
    }
  }, []);

  // Sync theme
  const setTheme = useCallback((newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('hub_theme', newTheme);
    } catch {
      // ignore
    }
  }, []);

  // Toast notification system
  const showToast = useCallback((text: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3800);
  }, []);

  const triggerReload = useCallback(() => {
    setReloadTrigger((v) => v + 1);
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.warn('Could not fetch stats', err);
    }
  }, []);

  const runJob = useCallback(
    async (jobType: 'news' | 'jobs') => {
      setIsRunningJob(true);
      showToast(lang === 'fa' ? 'در حال اجرای تسک و تحلیل با هوش مصنوعی...' : 'Running scraping & AI analysis...', 'info');
      try {
        const res = await api.runJob(jobType);
        showToast(res.summary, 'success');
        triggerReload();
        refreshStats();
      } catch (err) {
        showToast((err as Error).message, 'error');
      } finally {
        setIsRunningJob(false);
      }
    },
    [lang, showToast, triggerReload, refreshStats]
  );

  const runIranJob = useCallback(async () => {
    setIsRunningJob(true);
    showToast('در حال اسکن زنده جابینجا و جاب‌ویژن و تطبیق رزومه پایتون با جمنای...', 'info');
    try {
      const res = await api.scrapeIranJobs();
      showToast(res.summary, 'success');
      triggerReload();
      refreshStats();
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setIsRunningJob(false);
    }
  }, [showToast, triggerReload, refreshStats]);

  // Initialize
  useEffect(() => {
    setLang('fa');

    try {
      const storedTheme = localStorage.getItem('hub_theme') as 'dark' | 'light';
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        setTheme('dark');
      }
    } catch {
      setTheme('dark');
    }

    setPwaState(detectPWA());
    refreshStats();
  }, [setLang, setTheme, refreshStats]);

  useEffect(() => {
    refreshStats();
  }, [reloadTrigger, refreshStats]);

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        t,
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        selectedItem,
        setSelectedItem,
        stats,
        refreshStats,
        toasts,
        showToast,
        pwaState,
        reloadTrigger,
        triggerReload,
        runJob,
        runIranJob,
        isRunningJob,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
