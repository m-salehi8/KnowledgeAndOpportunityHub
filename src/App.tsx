import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { DesktopSidebar } from './components/DesktopSidebar';
import { ItemDetailModal } from './components/ItemDetailModal';
import { InboxView } from './components/views/InboxView';
import { JobsRadarView } from './components/views/JobsRadarView';
import { ProjectsView } from './components/views/ProjectsView';
import { SearchView } from './components/views/SearchView';
import { SavedView } from './components/views/SavedView';
import { SettingsView } from './components/views/SettingsView';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Sparkles, RefreshCw, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPersianDigits } from './utils/format';

const AppContent: React.FC = () => {
  const { activeTab, selectedItem, setSelectedItem, toasts, triggerReload, t, stats, theme, setTheme, runJob, isRunningJob } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'inbox':
        return <InboxView />;
      case 'jobs':
        return <JobsRadarView />;
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

  const getTabTitle = () => {
    switch (activeTab) {
      case 'inbox':
        return { title: 'صندوق ورودی جامع', desc: 'پیام‌های فورواردشده تلگرام، خلاصه اخبار روزانه و اعلان‌های متمرکز' };
      case 'jobs':
        return { title: 'رادار فرصت‌های شغلی', desc: 'آگهی‌های اسکن‌شده از منابع معتبر همراه با امتیاز تطابق هوش مصنوعی' };
      case 'projects':
        return { title: 'پروژه‌های منتخب', desc: 'ویترین ایده‌ها، مخازن متن‌باز و سیستم‌های توسعه‌یافته' };
      case 'search':
        return { title: 'جستجو و دسته‌بندی‌ها', desc: 'جستجوی هوشمند در عناوین، متن‌ها، برچسب‌ها و فیلترهای ترکیبی' };
      case 'saved':
        return { title: 'نشان‌شده‌ها و آرشیو', desc: 'دسترسی سریع به آیتم‌های ذخیره‌شده و بایگانی مقالات' };
      case 'settings':
        return { title: 'تنظیمات و وب‌هوک‌ها', desc: 'پیکربندی پروفایل، کلیدهای API، فیدهای RSS و اعلان‌های وب‌پوش' };
    }
  };

  const currentTabInfo = getTabTitle();

  return (
    <div className="min-h-[100dvh] bg-slate-100 dark:bg-[#0B0B0F] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Toast notifications container */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-[#161622]/95 backdrop-blur-xl border border-slate-200 dark:border-white/15 text-slate-900 dark:text-white text-xs shadow-xl"
            >
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-indigo-500 shrink-0" />}
              <span className="leading-snug font-medium">{toast.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Responsive Shell: Mobile-First Frame (< md) + Desktop Layout (>= md) */}
      <div className="w-full min-h-[100dvh] md:flex md:flex-row">
        {/* Desktop Sidebar (visible on md:) */}
        <DesktopSidebar />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col min-h-[100dvh] relative">
          {/* Mobile Header (visible only on mobile) */}
          <div className="md:hidden">
            <Header />
          </div>

          {/* Desktop Top Bar (visible on md:) */}
          <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-[#0E0E16]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/5 sticky top-0 z-20">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{currentTabInfo.title}</span>
                {activeTab === 'inbox' && stats && stats.unread_count > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold">
                    {toPersianDigits(stats.unread_count)} خوانده‌نشده
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentTabInfo.desc}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => (activeTab === 'jobs' ? runJob('jobs') : runJob('news'))}
                disabled={isRunningJob}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/80 dark:border-white/5 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunningJob ? 'animate-spin text-indigo-500' : ''}`} />
                <span>{activeTab === 'jobs' ? 'اجرای رادار شغلی' : 'به‌روزرسانی فیدها'}</span>
              </button>

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/5 transition-all"
                title={theme === 'dark' ? 'حالت روشن' : 'حالت تاریک'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600" />
                )}
              </button>
            </div>
          </header>

          {/* View Container: mobile centered, desktop wide container */}
          <main className="flex-1 w-full max-w-md md:max-w-5xl mx-auto pt-3 md:pt-6 md:px-6">
            {renderActiveView()}
          </main>

          {/* Mobile TabBar (hidden on md:) */}
          <TabBar />
        </div>
      </div>

      {/* Item Detail Sheet / Modal */}
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
