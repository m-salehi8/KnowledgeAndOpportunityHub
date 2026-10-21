import React from 'react';
import { Sparkles, Moon, Sun, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { theme, setTheme, activeTab, t, runJob, isRunningJob } = useApp();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleQuickRun = () => {
    if (activeTab === 'jobs') {
      runJob('jobs');
    } else {
      runJob('news');
    }
  };

  return (
    <header className="sticky top-0 z-30 pt-safe bg-white/80 dark:bg-[#0B0B0F]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/5 transition-colors duration-200">
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              {t.app_title}
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium truncate max-w-[170px]">
              {activeTab === 'inbox' && t.tab_inbox}
              {activeTab === 'jobs' && t.tab_jobs}
              {activeTab === 'projects' && t.tab_projects}
              {activeTab === 'search' && t.tab_search}
              {activeTab === 'saved' && t.tab_saved}
              {activeTab === 'settings' && t.tab_settings}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick AI Scraper Trigger */}
          <button
            onClick={handleQuickRun}
            disabled={isRunningJob}
            className="flex items-center justify-center w-8 h-8 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50"
            title={activeTab === 'jobs' ? t.manual_run_jobs : t.manual_run_news}
            aria-label={activeTab === 'jobs' ? t.manual_run_jobs : t.manual_run_news}
          >
            <RefreshCw className={`w-4 h-4 ${isRunningJob ? 'animate-spin text-indigo-500' : ''}`} />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 active:scale-95 transition-all border border-slate-200/60 dark:border-white/5"
            aria-label="Toggle Theme"
            title={theme === 'dark' ? 'حالت روشن (Light Mode)' : 'حالت تاریک (Dark Mode)'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
