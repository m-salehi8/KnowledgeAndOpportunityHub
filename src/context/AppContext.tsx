import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { Item, HubStats } from '../types';
import { translations, Language } from '../utils/i18n';
import { api } from '../api/client';
import { detectPWA, PWAState } from '../utils/pwa';

/** The five native tabs of the app. */
export type TabType = 'inbox' | 'jobs' | 'search' | 'saved' | 'settings';

/** Sections that live inside the Inbox tab (UISegmentedControl). */
export type InboxSection = 'feed' | 'projects' | 'producthunt';

export type ThemePreference = 'light' | 'dark' | 'system';

const TAB_IDS: TabType[] = ['inbox', 'jobs', 'search', 'saved', 'settings'];

interface ToastMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface AppContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: typeof translations['fa'];
  theme: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  setTheme: (t: ThemePreference) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  inboxSection: InboxSection;
  setInboxSection: (section: InboxSection) => void;
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

const readStoredTheme = (): ThemePreference => {
  try {
    const stored = localStorage.getItem('hub_theme') as ThemePreference | null;
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // ignore
  }
  return 'system';
};

const systemPrefersDark = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('fa');
  const [theme, setThemeState] = useState<ThemePreference>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(
    systemPrefersDark() ? 'dark' : 'light'
  );
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [inboxSection, setInboxSection] = useState<InboxSection>('feed');
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

  // Sync theme preference (light / dark / system)
  const setTheme = useCallback((newTheme: ThemePreference) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('hub_theme', newTheme);
    } catch {
      // ignore
    }
  }, []);

  // Resolve the effective theme and apply the `dark` class on <html>
  useEffect(() => {
    const apply = () => {
      const isDark = theme === 'system' ? systemPrefersDark() : theme === 'dark';
      setResolvedTheme(isDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', isDark);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', isDark ? '#000000' : '#F2F2F7');
    };

    apply();

    if (theme !== 'system' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, [theme]);

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
      showToast(
        lang === 'fa' ? 'در حال اجرای تسک و تحلیل با هوش مصنوعی...' : 'Running scraping & AI analysis...',
        'info'
      );
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
    showToast('در حال اسکن زنده جابینجا و جاب‌ویژن و تطبیق رزومه با هوش مصنوعی...', 'info');
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
    setThemeState(readStoredTheme());
    setPwaState(detectPWA());
    refreshStats();
  }, [setLang, refreshStats]);

  useEffect(() => {
    refreshStats();
  }, [reloadTrigger, refreshStats]);

  // Listen for SW push notification click navigation & URL params
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'producthunt') {
      setActiveTab('inbox');
      setInboxSection('producthunt');
    } else if (tabParam === 'projects') {
      setActiveTab('inbox');
      setInboxSection('projects');
    } else if (TAB_IDS.includes(tabParam as TabType)) {
      setActiveTab(tabParam as TabType);
    }

    const handleSWMessage = (event: MessageEvent) => {
      const target = event.data?.tab as string | undefined;
      if (!target) return;
      if (target === 'producthunt') {
        setActiveTab('inbox');
        setInboxSection('producthunt');
      } else if (target === 'projects') {
        setActiveTab('inbox');
        setInboxSection('projects');
      } else if (TAB_IDS.includes(target as TabType)) {
        setActiveTab(target as TabType);
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleSWMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
    };
  }, []);

  const value = useMemo<AppContextType>(
    () => ({
      lang,
      setLang,
      t,
      theme,
      resolvedTheme,
      setTheme,
      activeTab,
      setActiveTab,
      inboxSection,
      setInboxSection,
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
    }),
    [
      lang,
      setLang,
      t,
      theme,
      resolvedTheme,
      setTheme,
      activeTab,
      inboxSection,
      selectedItem,
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
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
