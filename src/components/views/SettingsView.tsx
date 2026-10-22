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
import { formatPercent } from '../../utils/format';

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
    <div className="space-y-4 px-4 pb-4">
      {/* Push Notification Opt-in Banner */}
      <PushNotificationBanner />

      {/* Profile & Job Radar Criteria */}
      <div className="ios-glass-card p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl border border-indigo-400/30 bg-indigo-400/12 text-indigo-600 dark:text-indigo-300 flex items-center justify-center backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
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
              className="ios-field w-full h-10 px-3 rounded-2xl text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">{t.skills_label}</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-indigo-400/30 bg-indigo-400/12 text-indigo-700 dark:text-indigo-200 text-xs font-medium backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
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
                className="ios-field flex-1 h-10 px-3 rounded-2xl text-xs"
              />
              <button
                type="button"
                onClick={addSkill}
                className="ios-action-pill ios-press shrink-0 justify-center px-4"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
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
                className="ios-field w-full h-10 px-3 rounded-2xl text-xs"
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
                className="ios-field w-full h-10 px-3 rounded-2xl text-xs font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">{t.keywords_include}</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {profile.keywords_include.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-emerald-400/30 bg-emerald-400/12 text-emerald-700 dark:text-emerald-200 text-xs font-medium backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
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
                className="ios-field flex-1 h-10 px-3 rounded-2xl text-xs"
              />
              <button
                type="button"
                onClick={addKeywordInclude}
                className="ios-action-pill ios-press shrink-0 justify-center px-4"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">{t.keywords_exclude}</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {profile.keywords_exclude.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-rose-400/30 bg-rose-400/12 text-rose-700 dark:text-rose-200 text-xs font-medium backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
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
                className="ios-field flex-1 h-10 px-3 rounded-2xl text-xs"
              />
              <button
                type="button"
                onClick={addKeywordExclude}
                className="ios-action-pill ios-press shrink-0 justify-center px-4"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="ios-press w-full h-11 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/20 shadow-lg shadow-indigo-600/25 backdrop-blur-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{t.save_profile}</span>
          </button>
        </form>
      </div>

      {/* Sources Manager */}
      <div className="ios-glass-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl border border-purple-400/30 bg-purple-400/12 text-purple-600 dark:text-purple-300 flex items-center justify-center backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
              <Rss className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.sources_title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.sources_desc}</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddingSource(!isAddingSource)}
            className="ios-action-pill ios-press shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.add_source}</span>
          </button>
        </div>

        {/* Add Source Form */}
        {isAddingSource && (
          <form
            onSubmit={handleAddSource}
            className="ios-glass-subtile p-3.5 space-y-3 text-xs"
          >
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">{t.source_name}</label>
              <input
                type="text"
                value={newSourceName}
                onChange={(e) => setNewSourceName(e.target.value)}
                placeholder="TechCrunch AI"
                className="ios-field w-full h-10 px-3 rounded-2xl text-xs"
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
                className="ios-field w-full h-10 px-3 rounded-2xl text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">{t.source_kind}</label>
              <select
                value={newSourceKind}
                onChange={(e) => setNewSourceKind(e.target.value as Source['kind'])}
                className="ios-field w-full h-10 px-3 rounded-2xl text-xs"
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
                className="ios-press flex-1 h-10 rounded-full bg-indigo-500/90 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center border border-white/20 shadow-lg shadow-indigo-600/25 backdrop-blur-md"
              >
                {lang === 'fa' ? 'افزودن' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSource(false)}
                className="ios-action-pill ios-press justify-center px-4"
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
              className="ios-glass-subtile p-3 flex items-center justify-between gap-3 text-xs"
            >
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white truncate">{src.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-slate-300/60 bg-slate-500/10 dark:border-white/15 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-mono backdrop-blur-md">
                    {src.kind}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
                  {src.url}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleSource(src)}
                  className={`ios-icon-button ios-press ${
                    src.enabled ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500'
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
                  className="ios-icon-button ios-press text-slate-400 hover:text-rose-500"
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
      <div className="ios-glass-card p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl border border-amber-400/30 bg-amber-400/12 text-amber-600 dark:text-amber-300 flex items-center justify-center backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
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
                className="ios-field w-full h-10 px-3 rounded-2xl text-xs font-mono"
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
                className="ios-field w-full h-10 px-3 rounded-2xl text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1 font-medium">
              <span>{lang === 'fa' ? 'حداقل امتیاز برای ارسال Push Notification' : 'Min Match Score for Push'}</span>
              <span className="font-sans text-indigo-600 dark:text-white font-bold">{formatPercent(settings.min_job_score_notify)}</span>
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
      <div className="ios-glass-card ios-specular p-5 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-sky-400 via-cyan-400 to-indigo-500" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(155deg, rgba(56,189,248,0.12) 0%, transparent 42%, rgba(34,211,238,0.06) 100%)',
          }}
        />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 shrink-0 rounded-2xl border border-sky-400/30 bg-sky-400/12 text-sky-600 dark:text-sky-300 flex items-center justify-center backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
              <Send className="w-4 h-4 -rotate-12" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
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
            className="ios-action-pill ios-press shrink-0 text-sky-700 dark:text-sky-200"
          >
            <span>{lang === 'fa' ? 'ورود به ربات' : 'Open Bot'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Credentials & status pills */}
        <div className="grid grid-cols-1 gap-2.5 text-xs">
          <div className="ios-glass-subtile p-2.5">
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

          <div className="ios-glass-subtile p-2.5">
            <span className="block text-[10px] text-slate-400 mb-0.5">
              {lang === 'fa' ? 'شناسه مجاز مالک (Chat ID)' : 'Authorized Owner ID'}
            </span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-bold dir-ltr">
              {telegramStatus?.owner_chat_id || '92127061'}
            </span>
          </div>

          <div className="ios-glass-subtile p-2.5">
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
        <div className="ios-glass-subtile p-3 text-[11px] text-slate-700 dark:text-slate-300 space-y-1.5">
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
        <div className="grid grid-cols-1 gap-2 pt-1">
          <button
            type="button"
            onClick={handleSyncTelegram}
            disabled={syncingTelegram}
            className="ios-press h-10 px-4 rounded-full bg-sky-500/85 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 border border-sky-200/30 backdrop-blur-md transition-all shadow-lg shadow-sky-500/20"
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
            className="ios-action-pill ios-press w-full justify-center disabled:opacity-50 text-slate-900 dark:text-white"
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
      <div className="ios-glass-card p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl border border-emerald-400/30 bg-emerald-400/12 text-emerald-600 dark:text-emerald-300 flex items-center justify-center backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
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
              className="ios-field w-full h-10 px-3 rounded-2xl text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 mb-1">{t.api_token_label}</label>
            <input
              type="password"
              value={settings.app_token}
              onChange={(e) => setSettings({ ...settings, app_token: e.target.value })}
              className="ios-field w-full h-10 px-3 rounded-2xl text-xs font-mono"
            />
          </div>

          <button
            onClick={handleSaveSettings}
            className="ios-press w-full h-10 rounded-full bg-emerald-400/15 hover:bg-emerald-400/25 text-emerald-700 dark:text-emerald-200 font-semibold text-xs flex items-center justify-center gap-2 border border-emerald-300/30 backdrop-blur-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{t.save_settings}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
