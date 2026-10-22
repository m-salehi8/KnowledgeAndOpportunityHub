import React, { useState, useEffect } from 'react';
import { Project, ProjectCategory, ProjectStatus } from '../../types';
import { toPersianDigits } from '../../utils/format';
import { useApp } from '../../context/AppContext';
import {
  FolderKanban,
  Sparkles,
  Star,
  ExternalLink,
  Github,
  Plus,
  Layers,
  Code2,
  Cpu,
  Database,
  Wrench,
  X,
  Search,
  Filter,
  ClipboardPaste,
  Send,
  Bot,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../api/client';

function mergeProjectLists(...lists: Project[][]): Project[] {
  const byId = new Map<string, Project>();
  for (const list of lists) {
    for (const project of list) {
      byId.set(project.id, project);
    }
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export const ProjectsView: React.FC = () => {
  const { showToast } = useApp();
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem('hub_projects');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
    }
    return [];
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  useEffect(() => {
    let cancelled = false;
    const loadRemoteProjects = async () => {
      try {
        const remote = await api.getProjects();
        if (!cancelled && remote.length > 0) {
          setProjects((prev) => mergeProjectLists(prev, remote));
        }
      } catch {
      }
    };
    loadRemoteProjects();
    const timer = setInterval(loadRemoteProjects, 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('hub_projects', JSON.stringify(projects));
    } catch {
    }
  }, [projects]);

  const handleSyncTelegram = async () => {
    setIsSyncingTelegram(true);
    showToast('در حال بررسی و همگام‌سازی پیام‌های دریافتی از بات تلگرام...', 'info');
    try {
      const res = await api.syncTelegramProjects();
      const remote = await api.getProjects().catch(() => [] as Project[]);
      if (remote.length > 0) {
        setProjects((prev) => mergeProjectLists(prev, remote));
      }
      showToast(res.message, res.synced_count > 0 ? 'success' : 'info');
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
      const remote = await api.getProjects().catch(() => [] as Project[]);
      if (remote.length > 0) {
        setProjects((prev) => mergeProjectLists(prev, remote));
      } else if (res.project) {
        setProjects((prev) => mergeProjectLists(prev, [res.project as Project]));
      }
      showToast(res.message, 'success');
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

    setNewTitle('');
    setNewShortDesc('');
    setNewFullDesc('');
    setNewTechStack('');
    setNewProgress(70);
    setNewGithub('');
    setNewLive('');
  };

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

  const totalCount = projects.length;
  const activeCount = projects.filter((p) => p.status === 'active').length;
  const prodCount = projects.filter((p) => p.status === 'production').length;
  const openSourceCount = projects.filter((p) => p.status === 'opensource').length;

  return (
    <div className="space-y-4 px-4 pb-4">
      <div className="ios-glass-card ios-specular overflow-hidden p-[18px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -start-20 h-56 w-56 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(99,102,241,0.38), rgba(34,211,238,0.18) 55%, transparent 72%)',
            filter: 'blur(28px)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -end-16 h-48 w-48 rounded-full opacity-70"
          style={{
            background:
              'radial-gradient(circle, rgba(34,211,238,0.28), transparent 70%)',
            filter: 'blur(30px)',
          }}
        />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-300/35 bg-indigo-400/15 px-3 py-1 text-[10px] font-bold text-indigo-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-md dark:text-indigo-100">
            <FolderKanban className="h-3 w-3" />
            <span>پروژه‌ها و دستاوردهای منتخب</span>
          </div>

          <h1 className="ios-glass-text mt-2 text-[22px] font-black leading-tight">
            ویترین پروژه‌ها و ایده‌های کلیدی
          </h1>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
            مدیریت و پایش یکپارچه پروژه‌های فعال، مخازن متن‌باز، سیستم‌های هوش مصنوعی و دستاوردهای فنی همراه با تحلیل خودکار Gemini.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsQuickModalOpen(true)}
              className="ios-press ios-glass-emerald flex h-9 items-center gap-1.5 rounded-full px-3 text-[10.5px] font-bold"
            >
              <ClipboardPaste className="h-3.5 w-3.5" /><span>ثبت سریع پیام یا لینک (Quick Paste)</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="ios-press ios-glass-pill flex h-9 items-center gap-1.5 px-3 text-[10.5px] font-bold text-slate-800 dark:text-white"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>افزودن دستی</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
            <div className="ios-glass-subtile p-2.5 text-center">
              <span className="metric-number block text-lg font-extrabold leading-none text-slate-900 dark:text-white">
                {toPersianDigits(totalCount)}
              </span>
              <p className="mt-1 text-[9.5px] font-medium leading-snug text-slate-500 dark:text-slate-400">کل پروژه‌ها</p>
            </div>
            <div className="ios-glass-subtile p-2.5 text-center">
              <span className="metric-number block text-lg font-extrabold leading-none text-emerald-600 dark:text-emerald-300">
                {toPersianDigits(prodCount)}
              </span>
              <p className="mt-1 text-[9.5px] font-medium leading-snug text-slate-500 dark:text-slate-400">آماده بهره‌برداری</p>
            </div>
            <div className="ios-glass-subtile p-2.5 text-center">
              <span className="metric-number block text-lg font-extrabold leading-none text-sky-600 dark:text-sky-300">
                {toPersianDigits(activeCount)}
              </span>
              <p className="mt-1 text-[9.5px] font-medium leading-snug text-slate-500 dark:text-slate-400">در حال توسعه</p>
            </div>
            <div className="ios-glass-subtile p-2.5 text-center">
              <span className="metric-number block text-lg font-extrabold leading-none text-amber-600 dark:text-amber-300">
                {toPersianDigits(openSourceCount)}
              </span>
              <p className="mt-1 text-[9.5px] font-medium leading-snug text-slate-500 dark:text-slate-400">متن‌باز و ابزارها</p>
            </div>
          </div>
        </div>
      </div>

      <div className="ios-glass-card ios-specular overflow-hidden p-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -start-16 h-52 w-52 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(14,165,233,0.3), rgba(34,211,238,0.14) 55%, transparent 72%)',
            filter: 'blur(28px)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -end-12 h-40 w-40 rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(34,211,238,0.22), transparent 70%)',
            filter: 'blur(26px)',
          }}
        />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-300/30 bg-sky-400/12 text-sky-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] dark:text-sky-300">
              <Send className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  ربات تلگرام ثبت و تحلیل پروژه‌ها
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  <span>متصل (Active)</span>
                </span>
              </div>
            </div>
          </div>

          <div className="ios-glass-subtile px-3 py-2 text-[10px] leading-relaxed text-slate-600 dark:text-sky-200/80">
            ربات:{' '}
            <a
              href="https://t.me/knowledgehubpwabot"
              target="_blank"
              rel="noreferrer"
              className="font-mono font-semibold text-sky-600 underline hover:text-sky-500 dark:text-sky-300 dark:hover:text-white"
            >
              @knowledgehubpwabot
            </a>
            <span className="mx-1 text-slate-400">·</span>
            شناسه مجاز تلگرام شما:{' '}
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono font-semibold text-slate-800 dark:text-white">
              92127061
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncTelegram}
              disabled={isSyncingTelegram}
              className="ios-press flex h-9 items-center gap-1.5 rounded-full border border-sky-300/40 bg-gradient-to-r from-sky-500/85 to-indigo-500/85 px-3.5 text-[10.5px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_22px_-8px_rgba(14,165,233,0.7)] transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncingTelegram ? 'animate-spin' : ''}`} />
              <span>{isSyncingTelegram ? 'در حال همگام‌سازی...' : 'همگام‌سازی پیام‌های تلگرام'}</span>
            </button>

            <button
              onClick={handleSimulateTelegram}
              disabled={isSimulatingTelegram}
              className="ios-press ios-glass-pill flex h-9 items-center gap-1.5 px-3 text-[10.5px] font-semibold text-slate-700 transition-all disabled:opacity-50 dark:text-slate-200"
              title="تست استخراج ایده با هوش مصنوعی"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-300" />
              <span>تست ارسال ایده</span>
            </button>
          </div>

          <div className="ios-glass-subtile flex items-start gap-2 p-3 text-[10.5px] leading-relaxed text-slate-600 dark:text-slate-300">
            <Bot className="mt-0.5 h-4 w-4 shrink-0 text-sky-500 dark:text-sky-400" />
            <span>
              <b>نحوه ثبت خودکار:</b> هر پیام، طرح یا لینک مخزن گیت‌هاب که در تلگرام به آیدی{' '}
              <a
                href="https://t.me/knowledgehubpwabot"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-sky-600 underline dark:text-sky-400"
              >
                @knowledgehubpwabot
              </a>{' '}
              بفرستید، مدل هوش مصنوعی Gemini ۳.۸ Flash مشخصات پروژه (عنوان، ویژگی‌ها، استک فنی، درصد پیشرفت و امتیاز تاثیر) را تحلیل کرده و خودکار در این ویترین ذخیره می‌نماید.
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در نام پروژه، فناوری‌ها یا توضیحات..."
            className="ios-field h-11 w-full rounded-full pe-10 ps-10 text-xs text-slate-900 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1">
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
              className={`ios-press shrink-0 px-3 py-2 text-[11px] font-semibold transition-all duration-150 ${
                activeCategory === cat.id
                  ? 'ios-glass-pill-active'
                  : 'ios-glass-pill text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1">
          <Filter className="ms-1 h-3.5 w-3.5 shrink-0 text-slate-400" />
          {[
            { id: 'all', label: 'همه وضعیت‌ها' },
            { id: 'production', label: 'آماده بهره‌برداری' },
            { id: 'active', label: 'در حال توسعه' },
            { id: 'opensource', label: 'متن‌باز' },
            { id: 'favorites', label: 'نشان‌شده‌ها' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setActiveStatus(st.id)}
              className={`ios-press shrink-0 px-2.5 py-1.5 text-[10px] font-semibold transition-all ${
                activeStatus === st.id
                  ? 'ios-glass-pill-active'
                  : 'ios-glass-pill text-slate-600 dark:text-slate-300'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="ios-glass-card ios-specular px-6 py-9 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-300/25 bg-indigo-400/10 text-indigo-500 dark:text-indigo-300">
            <FolderKanban className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            پروژه‌ای با این فیلتر پیدا نشد
          </h3>
          <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            می‌توانید فیلترها را ریست کنید یا با دکمه بالا اولین پروژه خود را به این بخش اضافه نمایید.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
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
                className="ios-glass-card ios-press group relative flex cursor-pointer flex-col justify-between overflow-hidden p-4"
              >
                <div>
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.055] px-2.5 py-1 text-[10px] font-semibold text-slate-600 backdrop-blur-md dark:text-slate-300">
                        {getCategoryIcon(project.category)}
                        <span>{getCategoryLabel(project.category)}</span>
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium ${statusInfo.color}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                        <span>{statusInfo.label}</span>
                      </span>

                      {project.source_channel === 'telegram' && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/15 px-2 py-0.5 text-[9px] font-bold text-sky-700 dark:text-sky-300">
                          <Send className="h-2.5 w-2.5 text-sky-500" />
                          <span>ثبت‌شده از تلگرام</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => toggleFavorite(project.id, e)}
                      className={`ios-press flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all ${
                        project.is_favorite
                          ? 'border-amber-300/35 bg-amber-400/15 text-amber-500 dark:text-amber-300'
                          : 'border-white/10 bg-white/[0.055] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                      title={project.is_favorite ? 'حذف از نشان‌شده‌ها' : 'نشان کردن'}
                    >
                      <Star className={`h-4 w-4 ${project.is_favorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                  </div>

                  <h3 className="text-[15px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">
                    {project.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                    {project.short_desc}
                  </p>

                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      <span>پیشرفت پروژه</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-300">
                        {toPersianDigits(project.progress_percent)}٪
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                        style={{ width: `${project.progress_percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="ios-glass-subtile mt-3 flex items-start gap-2 p-2.5 text-[10.5px] leading-relaxed text-indigo-950 dark:text-indigo-200">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500 dark:text-indigo-300" />
                    <span className="leading-relaxed">{project.ai_summary}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.tech_stack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="rounded-full border border-white/10 bg-white/[0.055] px-2 py-0.5 font-mono text-[9.5px] font-medium text-slate-600 backdrop-blur-md dark:text-slate-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-3">
                  <div className="flex items-center gap-1.5">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="ios-press inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.055] px-2.5 py-1 text-[10px] font-medium text-slate-600 backdrop-blur-md transition-colors dark:text-slate-300"
                      >
                        <Github className="h-3.5 w-3.5" />
                        <span>گیت‌هاب</span>
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="ios-press inline-flex items-center gap-1 rounded-full border border-indigo-300/30 bg-indigo-400/10 px-2.5 py-1 text-[10px] font-medium text-indigo-600 backdrop-blur-md transition-colors dark:text-indigo-300"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>مشاهده زنده</span>
                      </a>
                    )}
                  </div>

                  <span className="text-[10px] font-semibold text-indigo-600 transition-transform group-hover:translate-x-[-2px] dark:text-indigo-300">
                    جزئیات پروژه ←
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center">
            <div
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
              onClick={() => setSelectedProject(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="ios-glass-sheet relative max-h-[90dvh] w-full max-w-[430px] overflow-y-auto rounded-t-[38px] p-5 pb-safe"
            >
              <div className="ios-grabber" />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full border border-indigo-300/30 bg-indigo-400/10 px-2.5 py-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-300">
                      {getCategoryLabel(selectedProject.category)}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                        getStatusBadge(selectedProject.status).color
                      }`}
                    >
                      {getStatusBadge(selectedProject.status).label}
                    </span>
                  </div>
                  <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                    {selectedProject.title}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedProject(null)}
                  className="ios-press flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-slate-500 backdrop-blur-md transition-colors hover:text-slate-800 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="ios-glass-subtile mt-4 grid grid-cols-2 gap-3 p-3.5">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">پیشرفت کل</span>
                  <div className="metric-number mt-0.5 font-mono text-base font-bold text-indigo-600 dark:text-indigo-300">
                    {toPersianDigits(selectedProject.progress_percent)}٪
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">امتیاز اهمیت و نوآوری</span>
                  <div className="metric-number mt-0.5 font-mono text-base font-bold text-emerald-600 dark:text-emerald-300">
                    {toPersianDigits(selectedProject.impact_score)} از ۱۰۰
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="mb-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  شرح کامل و معماری پروژه
                </h4>
                <p className="ios-reader rounded-[20px] p-3.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                  {selectedProject.full_desc}
                </p>
              </div>

              <div className="mt-4 space-y-1 rounded-[20px] border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-3.5 backdrop-blur-xl">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>تحلیل هوش مصنوعی Gemini</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-200">
                  {selectedProject.ai_summary}
                </p>
              </div>

              <div className="mt-4">
                <h4 className="mb-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  فناوری‌های به‌کاررفته
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.tech_stack.map((t, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-white/10 bg-white/[0.055] px-2.5 py-1 font-mono text-[10px] font-medium text-slate-700 backdrop-blur-md dark:text-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedProject.github_url && (
                    <a
                      href={selectedProject.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="ios-press ios-glass-pill inline-flex items-center gap-1.5 px-3 py-2 text-[10.5px] font-bold text-slate-700 dark:text-slate-200"
                    >
                      <Github className="h-4 w-4" />
                      <span>مخزن گیت‌هاب</span>
                    </a>
                  )}
                  {selectedProject.live_url && (
                    <a
                      href={selectedProject.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="ios-press ios-glass-pill inline-flex items-center gap-1.5 px-3 py-2 text-[10.5px] font-bold text-indigo-600 dark:text-indigo-300"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>مشاهده زنده</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => setSelectedProject(null)}
                  className="ios-press ios-glass-pill px-4 py-2 text-[10.5px] font-semibold text-slate-700 dark:text-slate-300"
                >
                  بستن
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center">
            <div
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="ios-glass-sheet relative max-h-[90dvh] w-full max-w-[430px] overflow-y-auto rounded-t-[38px] p-5 pb-safe"
            >
              <div className="ios-grabber" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-indigo-300/30 bg-indigo-400/15 text-indigo-600 dark:text-indigo-300">
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    افزودن پروژه منتخب جدید
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="ios-press flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-slate-500 backdrop-blur-md transition-colors hover:text-slate-800 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddProject} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    نام پروژه *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: بات پردازش صوت و گفتار فارسی"
                    className="ios-field h-10 w-full rounded-2xl px-3.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      دسته‌بندی
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as ProjectCategory)}
                      className="ios-field h-10 w-full rounded-2xl px-3 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="ai">هوش مصنوعی</option>
                      <option value="fullstack">فول‌استک</option>
                      <option value="data">داده و زیرساخت</option>
                      <option value="tools">ابزارها</option>
                      <option value="mobile">موبایل و PWA</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      وضعیت کنونی
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ProjectStatus)}
                      className="ios-field h-10 w-full rounded-2xl px-3 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="active">در حال توسعه</option>
                      <option value="production">آماده بهره‌برداری</option>
                      <option value="opensource">متن‌باز</option>
                      <option value="concept">در مرحله ایده</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    توضیح کوتاه و هدف پروژه *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={newShortDesc}
                    onChange={(e) => setNewShortDesc(e.target.value)}
                    placeholder="خلاصه‌ای از قابلیت‌ها و مشکلاتی که این پروژه حل می‌کند..."
                    className="ios-field w-full rounded-2xl p-3 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    فناوری‌ها و استک (با ویرگول انگلیسی جدا کنید)
                  </label>
                  <input
                    type="text"
                    value={newTechStack}
                    onChange={(e) => setNewTechStack(e.target.value)}
                    placeholder="Python, FastAPI, React, PyTorch, Docker"
                    className="ios-field h-10 w-full rounded-2xl px-3.5 font-mono text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      لینک گیت‌هاب (اختیاری)
                    </label>
                    <input
                      type="url"
                      value={newGithub}
                      onChange={(e) => setNewGithub(e.target.value)}
                      placeholder="https://github.com/..."
                      className="ios-field h-10 w-full rounded-2xl px-3 font-mono text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      لینک دموی زنده (اختیاری)
                    </label>
                    <input
                      type="url"
                      value={newLive}
                      onChange={(e) => setNewLive(e.target.value)}
                      placeholder="https://..."
                      className="ios-field h-10 w-full rounded-2xl px-3 font-mono text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="ios-press ios-glass-pill px-4 py-2.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="ios-press ios-glass-emerald rounded-full px-5 py-2.5 text-[11px] font-bold"
                  >
                    ذخیره و ثبت پروژه
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {isQuickModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center">
            <div
              className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
              onClick={() => setIsQuickModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="ios-glass-sheet relative max-h-[90dvh] w-full max-w-[430px] overflow-y-auto rounded-t-[38px] p-5 pb-safe"
            >
              <div className="ios-grabber" />

              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-300/30 bg-emerald-400/15 text-emerald-600 dark:text-emerald-300">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    ثبت سریع پیام تلگرام یا لینک (Quick Paste)
                  </h3>
                </div>
                <button
                  onClick={() => setIsQuickModalOpen(false)}
                  className="ios-press flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-slate-500 backdrop-blur-md transition-colors hover:text-slate-800 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mt-3 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                هر پست یا متنی را که از تلگرام، گیت‌هاب یا وب کپی کرده‌اید اینجا Paste کنید. هوش مصنوعی جمنای خودکار عنوان، قابلیت‌ها، استک فنی و لینک‌ها را استخراج کرده و به گنجینه ابزارها اضافه می‌کند (همراه با ارسال اعلان وب‌پوش روی گوشی).
              </p>

              <form onSubmit={handleQuickAdd} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    متن پیام، توضیح یا لینک:
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={quickPasteText}
                    onChange={(e) => setQuickPasteText(e.target.value)}
                    placeholder="مثال: معرفی کتابخانه LangGraph Studio برای دیباگ ایجنت‌های هوش مصنوعی. ریپازیتوری: https://github.com/langchain-ai/langgraph-studio ..."
                    className="ios-field w-full rounded-2xl p-3.5 text-xs leading-relaxed text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsQuickModalOpen(false)}
                    className="ios-press ios-glass-pill px-4 py-2.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={isQuickAdding || !quickPasteText.trim()}
                    className="ios-press ios-glass-emerald flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-bold disabled:opacity-50"
                  >
                    <Sparkles className={`h-4 w-4 ${isQuickAdding ? 'animate-spin' : ''}`} />
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
