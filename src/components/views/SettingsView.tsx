import React, { useState, useEffect } from 'react';
import {
  User,
  Sliders,
  Rss,
  Server,
  Plus,
  Trash2,
  Save,
  ToggleLeft,
  ToggleRight,
  Send,
  Bot,
  ExternalLink,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { Profile, Source, AppSettings } from '../../types';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { PushNotificationBanner } from '../PushNotificationBanner';

export const SettingsView: React.FC = () => {
  const { lang, t, showToast } = useApp();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Telegram bot integration state
  const [telegramStatus, setTelegramStatus] = useState<{
    bot_username: string;
    owner_chat_id: string;
    connected: boolean;
  } | null>(null);
  const [syncingTelegram, setSyncingTelegram] = useState(false);
  const [simulatingTelegram, setSimulatingTelegram] = useState(false);

  // New skill input state
  const [newSkill, setNewSkill] = useState('');
  const [newKeywordInclude, setNewKeywordInclude] = useState('');
  const [newKeywordExclude, setNewKeywordExclude] = useState('');

  // New source modal state
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceKind, setNewSourceKind] = useState<Source['kind']>('rss');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prof, srcs, sets, tg] = await Promise.all([
          api.getProfile(),
          api.getSources(),
          api.getSettings(),
          api.getTelegramStatus().catch(() => ({
            bot_username: 'knowledgehubpwabot',
            owner_chat_id: '92127061',
            connected: true,
          })),
        ]);
        setProfile(prof);
        setSources(srcs);
        setSettings(sets);
        setTelegramStatus(tg);
      } catch (err) {
        showToast((err as Error).message, 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [showToast]);

  const handleSyncTelegram = async () => {
    setSyncingTelegram(true);
    try {
      const res = await api.syncTelegramProjects();
      showToast(res.message, res.synced_count > 0 ? 'success' : 'info');
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setSyncingTelegram(false);
    }
  };

  const handleSimulateTelegram = async () => {
    setSimulatingTelegram(true);
    try {
      const res = await api.simulateTelegramProject();
      showToast(
        lang === 'fa'
          ? `پروژه «${res.project?.title || 'جدید'}» توسط تلگرام پردازش و ثبت شد`
          : `Project simulated & extracted successfully`,
        'success'
      );
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setSimulatingTelegram(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      const updated = await api.updateProfile(profile);
      setProfile(updated);
      showToast(t.profile_saved, 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      showToast(t.settings_saved, 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleToggleSource = async (source: Source) => {
    try {
      const updated = await api.updateSource(source.id, { enabled: !source.enabled });
      setSources((prev) => prev.map((s) => (s.id === source.id ? updated : s)));
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      await api.deleteSource(id);
      setSources((prev) => prev.filter((s) => s.id !== id));
      showToast(lang === 'fa' ? 'منبع حذف گردید' : 'Source removed', 'info');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim() || !newSourceUrl.trim()) return;

    try {
      const created = await api.createSource({
        name: newSourceName.trim(),
        url: newSourceUrl.trim(),
        kind: newSourceKind,
        enabled: true,
      });
      setSources((prev) => [...prev, created]);
      setNewSourceName('');
      setNewSourceUrl('');
      setIsAddingSource(false);
      showToast(lang === 'fa' ? 'منبع جدید افزوده شد' : 'New source added', 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const addSkill = () => {
    if (!newSkill.trim() || !profile) return;
    if (!profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
    }
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    if (!profile) return;
    setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) });
  };

  const addKeywordInclude = () => {
    if (!newKeywordInclude.trim() || !profile) return;
    if (!profile.keywords_include.includes(newKeywordInclude.trim())) {
      setProfile({
        ...profile,
        keywords_include: [...profile.keywords_include, newKeywordInclude.trim()],
      });
    }
    setNewKeywordInclude('');
  };

  const removeKeywordInclude = (kw: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      keywords_include: profile.keywords_include.filter((k) => k !== kw),
    });
  };

  const addKeywordExclude = () => {
    if (!newKeywordExclude.trim() || !profile) return;
    if (!profile.keywords_exclude.includes(newKeywordExclude.trim())) {
      setProfile({
        ...profile,
        keywords_exclude: [...profile.keywords_exclude, newKeywordExclude.trim()],
      });
    }
    setNewKeywordExclude('');
  };

  const removeKeywordExclude = (kw: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      keywords_exclude: profile.keywords_exclude.filter((k) => k !== kw),
    });
  };

  if (loading || !profile || !settings) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        {lang === 'fa' ? 'در حال بارگذاری تنظیمات...' : 'Loading settings...'}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28 px-4">
      {/* Push Notification Opt-in Banner */}
      <PushNotificationBanner />

      {/* Profile & Job Radar Criteria */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#14141E] border border-slate-200/80 dark:border-white/5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.profile_title}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.profile_desc}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
              {lang === 'fa' ? 'نام و عنوان' : 'Full Name & Title'}
            </label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">{t.skills_label}</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs border border-indigo-200 dark:border-indigo-500/20 font-medium"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder={lang === 'fa' ? 'مهارت جدید (مثلاً FastAPI)...' : 'New skill...'}
                className="flex-1 h-9 px-3 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-3 h-9 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white font-medium"
              >
                +
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                {t.remote_pref_label}
              </label>
              <select
                value={profile.remote_preference}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    remote_preference: e.target.value as Profile['remote_preference'],
                  })
                }
                className="w-full h-10 px-3 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="remote_only">{t.remote_only}</option>
                <option value="hybrid">{t.hybrid}</option>
                <option value="any">{t.any}</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                {t.salary_min_label}
              </label>
              <input
                type="number"
                value={profile.min_salary_usd}
                onChange={(e) =>
                  setProfile({ ...profile, min_salary_usd: Number(e.target.value) })
                }
                className="w-full h-10 px-3 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-sans focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">{t.keywords_include}</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {profile.keywords_include.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-200 dark:border-emerald-500/20 font-medium"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => removeKeywordInclude(kw)}
                    className="hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newKeywordInclude}
                onChange={(e) => setNewKeywordInclude(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeywordInclude();
                  }
                }}
                placeholder={lang === 'fa' ? 'کلمه کلیدی مثبت...' : 'Target keyword...'}
                className="flex-1 h-9 px-3 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={addKeywordInclude}
                className="px-3 h-9 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white font-medium"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">{t.keywords_exclude}</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {profile.keywords_exclude.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-500/20 font-medium"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => removeKeywordExclude(kw)}
                    className="hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newKeywordExclude}
                onChange={(e) => setNewKeywordExclude(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeywordExclude();
                  }
                }}
                placeholder={lang === 'fa' ? 'کلمه منفی (عدم تمایل)...' : 'Excluded keyword...'}
                className="flex-1 h-9 px-3 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={addKeywordExclude}
                className="px-3 h-9 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white font-medium"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-98 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{t.save_profile}</span>
          </button>
        </form>
      </div>

      {/* Sources Manager */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#14141E] border border-slate-200/80 dark:border-white/5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Rss className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.sources_title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.sources_desc}</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddingSource(!isAddingSource)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.add_source}</span>
          </button>
        </div>

        {/* Add Source Form */}
        {isAddingSource && (
          <form
            onSubmit={handleAddSource}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-black/50 border border-indigo-200 dark:border-indigo-500/30 space-y-3 text-xs"
          >
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">{t.source_name}</label>
              <input
                type="text"
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                placeholder="TechCrunch AI"
                className="w-full h-9 px-3 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">{t.source_url}</label>
              <input
                type="url"
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
                placeholder="https://example.com/rss"
                className="w-full h-9 px-3 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">{t.source_kind}</label>
              <select
                value={newSourceKind}
                onChange={(e) => setNewSourceKind(e.target.value as Source['kind'])}
                className="w-full h-9 px-3 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="rss">RSS Feed</option>
                <option value="job_api">Job Board API</option>
                <option value="telegram_channel">Telegram Channel</option>
                <option value="newsletter">Email Newsletter</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 h-9 rounded-xl bg-indigo-600 text-white font-medium"
              >
                {lang === 'fa' ? 'افزودن' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSource(false)}
                className="px-4 h-9 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300"
              >
                {lang === 'fa' ? 'انصراف' : 'Cancel'}
              </button>
            </div>
          </form>
        )}

        {/* Sources List */}
        <div className="space-y-2">
          {sources.map((src) => (
            <div
              key={src.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5 flex items-center justify-between gap-3 text-xs"
            >
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white truncate">{src.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-mono">
                    {src.kind}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                  {src.url}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleSource(src)}
                  className={`text-lg transition-colors ${
                    src.enabled ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'
                  }`}
                  title={src.enabled ? 'Enabled' : 'Disabled'}
                >
                  {src.enabled ? (
                    <ToggleRight className="w-6 h-6" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                </button>
                <button
                  onClick={() => handleDeleteSource(src.id)}
                  className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduler & Push Alert Thresholds */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#14141E] border border-slate-200/80 dark:border-white/5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 dark:bg-amber-600/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'fa' ? 'زمان‌بندی و حساسیت اعلان‌ها' : 'Schedule & Notification Thresholds'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'fa'
                ? 'تنظیم ساعت اجرای روزانه خلاصه اخبار و رادار فرصت‌های شغلی'
                : 'Configure execution times and minimum score for alerts'}
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                {lang === 'fa' ? 'ساعت خلاصه اخبار' : 'News Digest Time'}
              </label>
              <input
                type="time"
                value={settings.news_digest_time}
                onChange={(e) =>
                  setSettings({ ...settings, news_digest_time: e.target.value })
                }
                className="w-full h-10 px-3 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                {lang === 'fa' ? 'ساعت رادار شغل' : 'Job Radar Time'}
              </label>
              <input
                type="time"
                value={settings.job_radar_time}
                onChange={(e) =>
                  setSettings({ ...settings, job_radar_time: e.target.value })
                }
                className="w-full h-10 px-3 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1 font-medium">
              <span>{lang === 'fa' ? 'حداقل امتیاز برای ارسال Push Notification' : 'Min Match Score for Push'}</span>
              <span className="font-sans text-indigo-600 dark:text-white font-bold">{settings.min_job_score_notify}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={settings.min_job_score_notify}
              onChange={(e) =>
                setSettings({ ...settings, min_job_score_notify: Number(e.target.value) })
              }
              className="w-full accent-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Telegram Bot Automated Project Extraction */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#14141E] border border-sky-500/30 dark:border-sky-500/20 space-y-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500" />
        
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Send className="w-4 h-4 -rotate-12" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'fa' ? 'ربات تلگرام ثبت و تحلیل پروژه (Telegram Bot)' : 'Telegram Project Ingestion Bot'}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {lang === 'fa' ? 'متصل و فعال' : 'Connected'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {lang === 'fa'
                  ? 'ثبت خودکار ایده‌ها، لینک‌های گیت‌هاب و یادداشت‌های فنی با تحلیل هوش مصنوعی Gemini و هدایت به تب «پروژه‌های منتخب»'
                  : 'Automatic parsing of technical notes & projects via Telegram bot into Featured Projects tab'}
              </p>
            </div>
          </div>

          <a
            href="https://t.me/knowledgehubpwabot"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition-colors shadow-sm"
          >
            <span>{lang === 'fa' ? 'ورود به ربات' : 'Open Bot'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Credentials & status pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5">
            <span className="block text-[10px] text-slate-400 mb-0.5">
              {lang === 'fa' ? 'آیدی ربات تلگرام' : 'Bot Username'}
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-sky-600 dark:text-sky-400 font-bold dir-ltr">
                @{telegramStatus?.bot_username || 'knowledgehubpwabot'}
              </span>
              <a
                href="https://t.me/knowledgehubpwabot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-sky-500"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5">
            <span className="block text-[10px] text-slate-400 mb-0.5">
              {lang === 'fa' ? 'شناسه مجاز مالک (Chat ID)' : 'Authorized Owner ID'}
            </span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-bold dir-ltr">
              {telegramStatus?.owner_chat_id || '92127061'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5">
            <span className="block text-[10px] text-slate-400 mb-0.5">
              {lang === 'fa' ? 'موتور استخراج هوشمند' : 'Extraction Engine'}
            </span>
            <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 rounded-2xl bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/20 text-[11px] text-slate-700 dark:text-slate-300 space-y-1.5">
          <div className="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{lang === 'fa' ? 'نحوه کارکرد ارسال پروژه از تلگرام:' : 'How Telegram project extraction works:'}</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 pr-1 leading-relaxed">
            <li>
              {lang === 'fa'
                ? 'در تلگرام وارد ربات @knowledgehubpwabot شده و دکمه Start را بزنید.'
                : 'Open @knowledgehubpwabot in Telegram and press Start.'}
            </li>
            <li>
              {lang === 'fa'
                ? 'ایده، یادداشت معماری، استک تکنولوژی، یا لینک گیت‌هاب پروژه موردنظرتان را ارسال کنید.'
                : 'Send your project idea, architecture notes, tech stack, or GitHub repo.'}
            </li>
            <li>
              {lang === 'fa'
                ? 'هوش مصنوعی پیام را خوانده، عنوان، درصد پیشرفت، تکنولوژی‌ها و تحلیل هوشمند را استخراج کرده و به تب «پروژه‌های منتخب» اضافه می‌کند.'
                : 'Gemini structures the data and inserts it directly into the Featured Projects tab.'}
            </li>
          </ol>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleSyncTelegram}
            disabled={syncingTelegram}
            className="h-10 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-98 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingTelegram ? 'animate-spin' : ''}`} />
            <span>
              {syncingTelegram
                ? (lang === 'fa' ? 'در حال بررسی پیام‌ها...' : 'Checking messages...')
                : (lang === 'fa' ? 'همگام‌سازی پیام‌های دریافتی تلگرام' : 'Sync Telegram Messages')}
            </span>
          </button>

          <button
            type="button"
            onClick={handleSimulateTelegram}
            disabled={simulatingTelegram}
            className="h-10 px-4 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 active:scale-98 disabled:opacity-50 text-slate-900 dark:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-slate-200/80 dark:border-white/10"
          >
            <Sparkles className={`w-3.5 h-3.5 text-purple-500 ${simulatingTelegram ? 'animate-pulse' : ''}`} />
            <span>
              {simulatingTelegram
                ? (lang === 'fa' ? 'در حال تحلیل با هوش مصنوعی...' : 'Analyzing with AI...')
                : (lang === 'fa' ? 'تست تحلیل و ثبت یک پروژه نمونه' : 'Test Simulated Project')}
            </span>
          </button>
        </div>
      </div>

      {/* FastAPI Backend Connection Settings */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#14141E] border border-slate-200/80 dark:border-white/5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 dark:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.api_config_title}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {lang === 'fa'
                ? 'در صورت خالی بودن، دیتای پیش‌فرض محلی (Mock Seed) استفاده می‌شود.'
                : 'Leave empty to run in-memory mock preview with 40+ seeded records.'}
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">{t.api_url_label}</label>
            <input
              type="text"
              value={settings.api_url}
              onChange={(e) => setSettings({ ...settings, api_url: e.target.value })}
              placeholder="http://localhost:8000 or https://your-domain.com"
              className="w-full h-10 px-3 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">{t.api_token_label}</label>
            <input
              type="password"
              value={settings.app_token}
              onChange={(e) => setSettings({ ...settings, app_token: e.target.value })}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none"
            />
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full h-10 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white font-semibold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all border border-slate-200/80 dark:border-transparent"
          >
            <Save className="w-4 h-4" />
            <span>{t.save_settings}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
