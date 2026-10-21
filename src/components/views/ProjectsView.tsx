import React, { useState, useEffect } from 'react';
import { Project, ProjectCategory, ProjectStatus } from '../../types';
import { initialProjects } from '../../data/mockProjects';
import { toPersianDigits } from '../../utils/format';
import { useApp } from '../../context/AppContext';
import {
  FolderKanban,
  Sparkles,
  Star,
  ExternalLink,
  Github,
  Plus,
  CheckCircle2,
  Clock,
  Layers,
  Code2,
  Cpu,
  Database,
  Wrench,
  X,
  Search,
  Filter,
  Send,
  Bot,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../api/client';

export const ProjectsView: React.FC = () => {
  const { showToast } = useApp();
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem('hub_projects');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return initialProjects;
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state for adding project
  const [newTitle, setNewTitle] = useState('');
  const [newShortDesc, setNewShortDesc] = useState('');
  const [newFullDesc, setNewFullDesc] = useState('');
  const [newCategory, setNewCategory] = useState<ProjectCategory>('ai');
  const [newStatus, setNewStatus] = useState<ProjectStatus>('active');
  const [newTechStack, setNewTechStack] = useState('');
  const [newProgress, setNewProgress] = useState(70);
  const [newGithub, setNewGithub] = useState('');
  const [newLive, setNewLive] = useState('');
  const [isSyncingTelegram, setIsSyncingTelegram] = useState(false);
  const [isSimulatingTelegram, setIsSimulatingTelegram] = useState(false);
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [quickPasteText, setQuickPasteText] = useState('');
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPasteText.trim()) {
      showToast('لطفاً متن پیام تلگرام یا لینک ابزار را وارد نمایید.', 'warning');
      return;
    }
    setIsQuickAdding(true);
    showToast('در حال استخراج مشخصات ابزار با هوش مصنوعی جمنای...', 'info');
    try {
      const res = await api.quickAddToolOrProject({
        text: quickPasteText.trim(),
      });
      if (res.project) {
        setProjects((prev) => [res.project, ...prev]);
        showToast(res.message, 'success');
        setQuickPasteText('');
        setIsQuickModalOpen(false);
      }
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setIsQuickAdding(false);
    }
  };

  // Persist projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hub_projects', JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [projects]);

  const handleSyncTelegram = async () => {
    setIsSyncingTelegram(true);
    showToast('در حال بررسی و همگام‌سازی پیام‌های دریافتی از بات تلگرام...', 'info');
    try {
      const res = await api.syncTelegramProjects();
      if (res.new_projects && res.new_projects.length > 0) {
        setProjects((prev) => [...res.new_projects, ...prev]);
        showToast(res.message, 'success');
      } else {
        showToast(res.message || 'پیام جدیدی در ربات یافت نشد.', 'info');
      }
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setIsSyncingTelegram(false);
    }
  };

  const handleSimulateTelegram = async () => {
    setIsSimulatingTelegram(true);
    showToast('در حال استخراج مشخصات پروژه از پیام تلگرام با هوش مصنوعی جمنای...', 'info');
    try {
      const res = await api.simulateTelegramProject();
      if (res.project) {
        setProjects((prev) => [res.project, ...prev]);
        showToast(res.message, 'success');
      }
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setIsSimulatingTelegram(false);
    }
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = !p.is_favorite;
          showToast(
            updated ? 'پروژه به علاقه‌مندی‌ها اضافه شد' : 'پروژه از علاقه‌مندی‌ها حذف شد',
            'success'
          );
          return { ...p, is_favorite: updated };
        }
        return p;
      })
    );
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newShortDesc.trim()) {
      showToast('لطفاً عنوان و توضیح کوتاه پروژه را وارد کنید', 'error');
      return;
    }

    const techArray = newTechStack
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: newTitle.trim(),
      short_desc: newShortDesc.trim(),
      full_desc: newFullDesc.trim() || newShortDesc.trim(),
      category: newCategory,
      status: newStatus,
      tech_stack: techArray.length > 0 ? techArray : ['Full-Stack', 'Modern Web'],
      progress_percent: Number(newProgress) || 50,
      impact_score: Math.floor(Math.random() * 15) + 85,
      ai_summary: 'پروژه جدید با معماری مدرن و قابلیت‌های ارزش‌آفرین افزوده شد.',
      github_url: newGithub.trim() || undefined,
      live_url: newLive.trim() || undefined,
      created_at: new Date().toISOString(),
      is_favorite: true,
      stars_count: 1,
    };

    setProjects([newProj, ...projects]);
    setIsAddModalOpen(false);
    showToast('پروژه منتخب با موفقیت اضافه شد', 'success');

    // Reset form
    setNewTitle('');
    setNewShortDesc('');
    setNewFullDesc('');
    setNewTechStack('');
    setNewProgress(70);
    setNewGithub('');
    setNewLive('');
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    if (activeStatus === 'favorites' && !p.is_favorite) return false;
    if (activeStatus !== 'all' && activeStatus !== 'favorites' && p.status !== activeStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.short_desc.toLowerCase().includes(q) || p.full_desc.toLowerCase().includes(q);
      const matchTech = p.tech_stack.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTech) return false;
    }
    return true;
  });

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'production':
        return {
          label: 'آماده بهره‌برداری',
          color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
          dot: 'bg-emerald-500',
        };
      case 'active':
        return {
          label: 'در حال توسعه',
          color: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/25',
          dot: 'bg-indigo-500',
        };
      case 'opensource':
        return {
          label: 'متن‌باز',
          color: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/25',
          dot: 'bg-sky-500',
        };
      case 'concept':
        return {
          label: 'در مرحله ایده',
          color: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25',
          dot: 'bg-amber-500',
        };
    }
  };

  const getCategoryIcon = (category: ProjectCategory) => {
    switch (category) {
      case 'ai':
        return <Cpu className="w-3.5 h-3.5 text-indigo-500" />;
      case 'fullstack':
        return <Layers className="w-3.5 h-3.5 text-violet-500" />;
      case 'data':
        return <Database className="w-3.5 h-3.5 text-sky-500" />;
      case 'tools':
        return <Wrench className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Code2 className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getCategoryLabel = (category: ProjectCategory) => {
    switch (category) {
      case 'ai':
        return 'هوش مصنوعی';
      case 'fullstack':
        return 'فول‌استک';
      case 'data':
        return 'داده و زیرساخت';
      case 'tools':
        return 'ابزارها';
      case 'mobile':
        return 'موبایل و PWA';
    }
  };

  // Metrics
  const totalCount = projects.length;
  const activeCount = projects.filter((p) => p.status === 'active').length;
  const prodCount = projects.filter((p) => p.status === 'production').length;
  const openSourceCount = projects.filter((p) => p.status === 'opensource').length;

  return (
    <div className="px-4 pb-28 md:pb-12 max-w-6xl mx-auto space-y-6">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl p-5 md:p-7 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-xl shadow-indigo-600/15 border border-indigo-400/20">
        <div className="absolute top-0 end-0 -mt-8 -me-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 start-0 -mb-8 -ms-8 w-40 h-40 bg-violet-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-white/90 border border-white/20">
              <FolderKanban className="w-3.5 h-3.5" />
              <span>پروژه‌ها و دستاوردهای منتخب</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              ویترین پروژه‌ها و ایده‌های کلیدی
            </h1>
            <p className="text-xs md:text-sm text-indigo-100 max-w-xl leading-relaxed">
              مدیریت و پایش یکپارچه پروژه‌های فعال، مخازن متن‌باز، سیستم‌های هوش مصنوعی و دستاوردهای فنی همراه با تحلیل خودکار Gemini.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsQuickModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>📋 ثبت سریع پیام یا لینک (Quick Paste)</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shadow-lg shadow-black/15 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>افزودن دستی</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 text-center">
            <span className="text-lg md:text-xl font-bold font-mono">{toPersianDigits(totalCount)}</span>
            <p className="text-[11px] text-indigo-100 mt-0.5">کل پروژه‌ها</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 text-center">
            <span className="text-lg md:text-xl font-bold font-mono text-emerald-300">{toPersianDigits(prodCount)}</span>
            <p className="text-[11px] text-indigo-100 mt-0.5">آماده بهره‌برداری</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 text-center">
            <span className="text-lg md:text-xl font-bold font-mono text-sky-200">{toPersianDigits(activeCount)}</span>
            <p className="text-[11px] text-indigo-100 mt-0.5">در حال توسعه</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 text-center">
            <span className="text-lg md:text-xl font-bold font-mono text-amber-200">{toPersianDigits(openSourceCount)}</span>
            <p className="text-[11px] text-indigo-100 mt-0.5">متن‌باز و ابزارها</p>
          </div>
        </div>
      </div>

      {/* Telegram Bot Integration Card */}
      <div className="rounded-3xl p-4 md:p-5 bg-gradient-to-br from-sky-950/50 via-[#131b2e] to-[#0f1424] border border-sky-500/30 text-white shadow-lg space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0 shadow-inner">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm md:text-base font-bold text-white">
                  ربات تلگرام ثبت و تحلیل پروژه‌ها
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>متصل (Active)</span>
                </span>
              </div>
              <p className="text-[11px] md:text-xs text-sky-200/80 mt-0.5">
                ربات: <a href="https://t.me/knowledgehubpwabot" target="_blank" rel="noreferrer" className="text-sky-300 font-mono underline hover:text-white">@knowledgehubpwabot</a> · شناسه مجاز تلگرام شما: <span className="font-mono text-white bg-white/10 px-1.5 py-0.5 rounded">92127061</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSyncTelegram}
              disabled={isSyncingTelegram}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTelegram ? 'animate-spin' : ''}`} />
              <span>{isSyncingTelegram ? 'در حال همگام‌سازی...' : 'همگام‌سازی پیام‌های تلگرام'}</span>
            </button>

            <button
              onClick={handleSimulateTelegram}
              disabled={isSimulatingTelegram}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 text-xs font-semibold active:scale-95 transition-all disabled:opacity-50"
              title="تست استخراج ایده با هوش مصنوعی"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">تست ارسال ایده</span>
            </button>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2">
          <Bot className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <span>
            <b>نحوه ثبت خودکار:</b> هر پیام، طرح یا لینک مخزن گیت‌هاب که در تلگرام به آیدی <a href="https://t.me/knowledgehubpwabot" target="_blank" rel="noreferrer" className="text-sky-400 underline font-mono">@knowledgehubpwabot</a> بفرستید، مدل هوش مصنوعی Gemini ۳.۸ Flash مشخصات پروژه (عنوان، ویژگی‌ها، استک فنی، درصد پیشرفت و امتیاز تاثیر) را تحلیل کرده و خودکار در این ویترین ذخیره می‌نماید.
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در نام پروژه، فناوری‌ها یا توضیحات..."
            className="w-full h-11 ps-10 pe-4 rounded-2xl bg-white dark:bg-[#151520] border border-slate-200 dark:border-white/10 text-xs md:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'همه حوزه‌ها' },
            { id: 'ai', label: 'هوش مصنوعی' },
            { id: 'fullstack', label: 'فول‌استک' },
            { id: 'data', label: 'داده و زیرساخت' },
            { id: 'tools', label: 'ابزارها' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                  : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-slate-500 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ms-1" />
          {[
            { id: 'all', label: 'همه وضعیت‌ها' },
            { id: 'production', label: 'آماده بهره‌برداری' },
            { id: 'active', label: 'در حال توسعه' },
            { id: 'opensource', label: 'متن‌باز' },
            { id: 'favorites', label: 'نشان‌شده‌ها ⭐' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setActiveStatus(st.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                activeStatus === st.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid: 1 col on mobile, 2 cols on md, 3 cols on xl */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-[#12121C] border border-slate-200/80 dark:border-white/5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-3">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            پروژه‌ای با این فیلتر پیدا نشد
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            می‌توانید فیلترها را ریست کنید یا با دکمه بالا اولین پروژه خود را به این بخش اضافه نمایید.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
          {filteredProjects.map((project) => {
            const statusInfo = getStatusBadge(project.status);
            return (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setSelectedProject(project)}
                className="group relative flex flex-col justify-between rounded-3xl p-5 bg-white dark:bg-[#13131E] border border-slate-200/80 dark:border-white/10 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
              >
                {/* Top Badge Zone */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/5">
                        {getCategoryIcon(project.category)}
                        <span>{getCategoryLabel(project.category)}</span>
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium border ${statusInfo.color}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                        <span>{statusInfo.label}</span>
                      </span>

                      {project.source_channel === 'telegram' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                          <Send className="w-2.5 h-2.5 text-sky-500" />
                          <span>ثبت‌شده از تلگرام</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => toggleFavorite(project.id, e)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                          project.is_favorite
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                        }`}
                        title={project.is_favorite ? 'حذف از نشان‌شده‌ها' : 'نشان کردن'}
                      >
                        <Star className={`w-4 h-4 ${project.is_favorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                    {project.short_desc}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-3.5 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      <span>پیشرفت پروژه</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {toPersianDigits(project.progress_percent)}٪
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                        style={{ width: `${project.progress_percent}%` }}
                      />
                    </div>
                  </div>

                  {/* AI Highlight */}
                  <div className="mt-3 p-2.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-[11px] text-indigo-950 dark:text-indigo-200 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{project.ai_summary}</span>
                  </div>

                  {/* Tech Stack Chips */}
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {project.tech_stack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 text-[10px] font-mono font-medium text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-white/5"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>گیت‌هاب</span>
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>مشاهده زنده</span>
                      </a>
                    )}
                  </div>

                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-[-2px] transition-transform">
                    جزئیات پروژه ←
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#151522] border border-slate-200 dark:border-white/15 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {getCategoryLabel(selectedProject.category)}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium border ${
                        getStatusBadge(selectedProject.status).color
                      }`}
                    >
                      {getStatusBadge(selectedProject.status).label}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                    {selectedProject.title}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedProject(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress and Impact */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">پیشرفت کل</span>
                  <div className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {toPersianDigits(selectedProject.progress_percent)}٪
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">امتیاز اهمیت و نوآوری</span>
                  <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {toPersianDigits(selectedProject.impact_score)} از ۱۰۰
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  شرح کامل و معماری پروژه
                </h4>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-200/60 dark:border-white/5">
                  {selectedProject.full_desc}
                </p>
              </div>

              {/* AI Rationale */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تحلیل هوش مصنوعی Gemini</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                  {selectedProject.ai_summary}
                </p>
              </div>

              {/* Tech Stack */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  فناوری‌های به‌کاررفته
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.tech_stack.map((t, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-mono font-medium text-slate-800 dark:text-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedProject.github_url && (
                    <a
                      href={selectedProject.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold"
                    >
                      <Github className="w-4 h-4" />
                      <span>مخزن گیت‌هاب</span>
                    </a>
                  )}
                  {selectedProject.live_url && (
                    <a
                      href={selectedProject.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>مشاهده زنده</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  بستن
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Project Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#151522] border border-slate-200 dark:border-white/15 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    افزودن پروژه منتخب جدید
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddProject} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    نام پروژه *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: بات پردازش صوت و گفتار فارسی"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      دسته‌بندی
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as ProjectCategory)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ai">هوش مصنوعی</option>
                      <option value="fullstack">فول‌استک</option>
                      <option value="data">داده و زیرساخت</option>
                      <option value="tools">ابزارها</option>
                      <option value="mobile">موبایل و PWA</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      وضعیت کنونی
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ProjectStatus)}
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="active">در حال توسعه</option>
                      <option value="production">آماده بهره‌برداری</option>
                      <option value="opensource">متن‌باز</option>
                      <option value="concept">در مرحله ایده</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    توضیح کوتاه و هدف پروژه *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={newShortDesc}
                    onChange={(e) => setNewShortDesc(e.target.value)}
                    placeholder="خلاصه‌ای از قابلیت‌ها و مشکلاتی که این پروژه حل می‌کند..."
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    فناوری‌ها و استک (با ویرگول انگلیسی جدا کنید)
                  </label>
                  <input
                    type="text"
                    value={newTechStack}
                    onChange={(e) => setNewTechStack(e.target.value)}
                    placeholder="Python, FastAPI, React, PyTorch, Docker"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      لینک گیت‌هاب (اختیاری)
                    </label>
                    <input
                      type="url"
                      value={newGithub}
                      onChange={(e) => setNewGithub(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      لینک دموی زنده (اختیاری)
                    </label>
                    <input
                      type="url"
                      value={newLive}
                      onChange={(e) => setNewLive(e.target.value)}
                      placeholder="https://..."
                      className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
                  >
                    ذخیره و ثبت پروژه
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {/* Quick Paste Modal */}
        {isQuickModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-[#161622] rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    ثبت سریع پیام تلگرام یا لینک (Quick Paste)
                  </h3>
                </div>
                <button
                  onClick={() => setIsQuickModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                هر پست یا متنی را که از تلگرام، گیت‌هاب یا وب کپی کرده‌اید اینجا Paste کنید. هوش مصنوعی جمنای خودکار عنوان، قابلیت‌ها، استک فنی و لینک‌ها را استخراج کرده و به گنجینه ابزارها اضافه می‌کند (همراه با ارسال اعلان وب‌پوش روی گوشی).
              </p>

              <form onSubmit={handleQuickAdd} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    متن پیام، توضیح یا لینک:
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={quickPasteText}
                    onChange={(e) => setQuickPasteText(e.target.value)}
                    placeholder="مثال: معرفی کتابخانه LangGraph Studio برای دیباگ ایجنت‌های هوش مصنوعی. ریپازیتوری: https://github.com/langchain-ai/langgraph-studio ..."
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsQuickModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={isQuickAdding || !quickPasteText.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className={`w-4 h-4 ${isQuickAdding ? 'animate-spin' : ''}`} />
                    <span>{isQuickAdding ? 'در حال تحلیل با هوش مصنوعی...' : 'تحلیل و ذخیره در گنجینه'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
