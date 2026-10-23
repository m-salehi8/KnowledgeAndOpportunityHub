// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Rss,
  Server,
  Plus,
  Trash2,
  Save,
  Send,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Clock,
  Bell,
  Palette,
  ChevronLeft,
  Minus,
  CircleAlert,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Profile, Source, AppSettings } from '../../types';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { PushNotificationBanner } from '../PushNotificationBanner';
import { formatPercent, toPersianDigits } from '../../utils/format';
import { Pressable, SectionHeader, SegmentedControl, Switch } from '../ui';
import { hapticImpact } from '../../utils/haptics';

type ConnectionState = 'preview' | 'connected' | 'offline' | 'checking';

const LOCAL_SETTINGS_KEY = 'hub_settings_v1';

const readLocalConnection = (): { api_url: string; app_token: string } => {
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (!raw) return { api_url: '', app_token: '' };
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      api_url: parsed.api_url?.trim() || '',
      app_token: parsed.app_token?.trim() || '',
    };
  } catch {
    return { api_url: '', app_token: '' };
  }
};

const SettingsGroup: React.FC<{
  title: string;
  footer?: string;
  children: React.ReactNode;
}> = ({ title, footer, children }) => (
  <section className="mb-6">
    <SectionHeader title={title} />
    <div className="ios-list overflow-hidden">{children}</div>
    {footer && (
      <p className="mt-2 px-2 text-[11px] leading-[1.7] text-[var(--text-secondary)]">{footer}</p>
    )}
  </section>
);

export const SettingsView: React.FC = () => {
  const { lang, t, showToast, theme, setTheme } = useApp();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const [telegramStatus, setTelegramStatus] = useState<{
    bot_username: string;
    owner_chat_id: string;
    connected: boolean;
  } | null>(null);
  const [syncingTelegram, setSyncingTelegram] = useState(false);
  const [simulatingTelegram, setSimulatingTelegram] = useState(false);

  const [newSkill, setNewSkill] = useState('');
  const [newKeywordInclude, setNewKeywordInclude] = useState('');
  const [newKeywordExclude, setNewKeywordExclude] = useState('');

  const [isAddingSource, setIsAddingSource] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceKind, setNewSourceKind] = useState<Source['kind']>('rss');

  const [connection, setConnection] = useState<ConnectionState>('preview');
  const [showToken, setShowToken] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prof, srcs, sets, tg] = await Promise.all([
          api.getProfile(),
          api.getSources(),
          api.getSettings(),
          api.getTelegramStatus().catch(() => null),
        ]);
        setProfile(prof);
        setSources(srcs);
        // The backend settings payload does not carry the connection fields,
        // so keep whatever is stored locally for the API url / token.
        setSettings({ ...sets, ...readLocalConnection() });
        setTelegramStatus(tg);
        setConnection(sets.api_url ? 'offline' : 'preview');
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
      showToast(`پروژه «${res.project?.title || 'جدید'}» ثبت شد`, 'success');
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
      // Persist locally first so the client switches to the remote backend
      // immediately, even if the backend does not know these fields.
      try {
        const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
        const stored = raw ? (JSON.parse(raw) as AppSettings) : ({} as AppSettings);
        localStorage.setItem(
          LOCAL_SETTINGS_KEY,
          JSON.stringify({
            ...stored,
            notifications_enabled: settings.notifications_enabled,
            news_digest_time: settings.news_digest_time,
            job_radar_time: settings.job_radar_time,
            min_job_score_notify: settings.min_job_score_notify,
            api_url: settings.api_url,
            app_token: settings.app_token,
          })
        );
      } catch {
        // ignore
      }

      const updated = await api.updateSettings(settings);
      setSettings({ ...updated, api_url: settings.api_url, app_token: settings.app_token });
      setConnection(settings.api_url?.trim() ? 'offline' : 'preview');
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
      hapticImpact();
      await api.deleteSource(id);
      setSources((prev) => prev.filter((s) => s.id !== id));
      showToast('منبع حذف گردید', 'info');
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
      showToast('منبع جدید افزوده شد', 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  };

  const testConnection = async () => {
    if (!settings) return;
    if (!settings.api_url.trim()) {
      setConnection('preview');
      showToast('آدرسی وارد نشده است — حالت پیش‌نمایش محلی فعال است', 'info');
      return;
    }
    setConnection('checking');
    const base = settings.api_url.replace(/\/$/, '');
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${base}/healthz`, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        setConnection('connected');
        showToast('اتصال به سرور برقرار است', 'success');
      } else {
        setConnection('offline');
        showToast('سرور پاسخ معتبر نداد', 'error');
      }
    } catch {
      setConnection('offline');
      showToast('اتصال به سرور ناموفق بود', 'error');
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

  const adjustScore = (delta: number) => {
    if (!settings) return;
    const next = Math.min(95, Math.max(50, settings.min_job_score_notify + delta));
    setSettings({ ...settings, min_job_score_notify: next });
  };

  if (loading || !profile || !settings) {
    return (
      <div className="px-4">
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="ios-skeleton h-[120px] rounded-[var(--r-card)]" />
          ))}
        </div>
      </div>
    );
  }

  const connectionLabel: Record<ConnectionState, string> = {
    preview: 'حالت پیش‌نمایش (داده‌ی محلی)',
    connected: 'متصل',
    offline: 'قطع',
    checking: 'در حال بررسی...',
  };

  const connectionColor: Record<ConnectionState, string> = {
    preview: 'var(--text-secondary)',
    connected: 'var(--success)',
    offline: 'var(--danger)',
    checking: 'var(--warning)',
  };

  return (
    <div className="px-4 pb-2">
      <PushNotificationBanner />

      {/* ---------------------------------------------------------- */}
      {/* Profile                                                     */}
      {/* ---------------------------------------------------------- */}
      <SettingsGroup title="پروفایل و معیارهای رادار" footer={t.profile_desc}>
        <form onSubmit={handleSaveProfile}>
          <div className="ios-list-row">
            <span
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px]"
              style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              aria-hidden="true"
            >
              <User className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <label className="min-w-0 flex-1">
              <span className="ios-row-title block">نام و عنوان</span>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="mt-0.5 w-full bg-transparent text-[13px] text-[var(--text-secondary)] outline-none"
              />
            </label>
          </div>

          <div className="ios-list-row flex-col items-start gap-2">
            <span className="ios-row-title">{t.skills_label}</span>
            <div className="flex w-full flex-wrap gap-1.5">
              {profile.skills.map((skill) => (
                <span key={skill} className="ios-chip h-[26px] min-h-[26px] px-2.5 text-[11px]">
                  <bdi dir="ltr">{skill}</bdi>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-[var(--text-tertiary)]"
                    aria-label={`حذف ${skill}`}
                  >
                    <X className="h-3 w-3" strokeWidth={1.75} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex w-full items-center gap-2">
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
                placeholder="مهارت جدید…"
                className="ios-field flex-1"
                aria-label="افزودن مهارت"
              />
              <Pressable
                onClick={addSkill}
                className="ios-icon-button h-11 w-11 shrink-0 bg-[var(--accent-soft)] text-[var(--accent)]"
                aria-label="افزودن مهارت"
              >
                <Plus className="h-4 w-4" strokeWidth={1.75} />
              </Pressable>
            </div>
          </div>

          <div className="ios-list-row">
            <div className="min-w-0 flex-1">
              <p className="ios-row-title">{t.remote_pref_label}</p>
              <p className="ios-row-subtitle">شیوه همکاری موردنظر</p>
            </div>
            <select
              value={profile.remote_preference}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  remote_preference: e.target.value as Profile['remote_preference'],
                })
              }
              aria-label={t.remote_pref_label}
              className="ios-field h-10 w-[130px] shrink-0 text-[13px]"
            >
              <option value="remote_only">{t.remote_only}</option>
              <option value="hybrid">{t.hybrid}</option>
              <option value="any">{t.any}</option>
            </select>
          </div>

          <div className="ios-list-row">
            <div className="min-w-0 flex-1">
              <p className="ios-row-title">{t.salary_min_label}</p>
              <p className="ios-row-subtitle">عدد به دلار</p>
            </div>
            <input
              type="number"
              value={profile.min_salary_usd}
              onChange={(e) =>
                setProfile({ ...profile, min_salary_usd: Number(e.target.value) })
              }
              className="ios-field h-10 w-[110px] shrink-0 text-[13px]"
            />
          </div>
        </form>
      </SettingsGroup>

      {/* ---------------------------------------------------------- */}
      {/* Keywords                                                    */}
      {/* ---------------------------------------------------------- */}
      <SettingsGroup title="کلمات کلیدی">
        <div className="ios-list-row flex-col items-start gap-2">
          <span className="ios-row-title">{t.keywords_include}</span>
          <div className="flex w-full flex-wrap gap-1.5">
            {profile.keywords_include.map((kw) => (
              <span key={kw} className="ios-chip h-[26px] min-h-[26px] px-2.5 text-[11px]" data-tone="success">
                {kw}
                <button
                  type="button"
                  onClick={() => removeKeywordInclude(kw)}
                  className="text-[var(--text-tertiary)]"
                  aria-label={`حذف ${kw}`}
                >
                  <X className="h-3 w-3" strokeWidth={1.75} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex w-full items-center gap-2">
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
              placeholder="کلمه کلیدی مثبت…"
              className="ios-field flex-1"
              aria-label="افزودن کلمه کلیدی مثبت"
            />
            <Pressable
              onClick={addKeywordInclude}
              className="ios-icon-button h-11 w-11 shrink-0 bg-[var(--accent-soft)] text-[var(--accent)]"
              aria-label="افزودن کلمه کلیدی مثبت"
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} />
            </Pressable>
          </div>
        </div>

        <div className="ios-list-row flex-col items-start gap-2">
          <span className="ios-row-title">{t.keywords_exclude}</span>
          <div className="flex w-full flex-wrap gap-1.5">
            {profile.keywords_exclude.map((kw) => (
              <span key={kw} className="ios-chip h-[26px] min-h-[26px] px-2.5 text-[11px]" data-tone="danger">
                {kw}
                <button
                  type="button"
                  onClick={() => removeKeywordExclude(kw)}
                  className="text-[var(--text-tertiary)]"
                  aria-label={`حذف ${kw}`}
                >
                  <X className="h-3 w-3" strokeWidth={1.75} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex w-full items-center gap-2">
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
              placeholder="کلمه منفی…"
              className="ios-field flex-1"
              aria-label="افزودن کلمه کلیدی منفی"
            />
            <Pressable
              onClick={addKeywordExclude}
              className="ios-icon-button h-11 w-11 shrink-0 bg-[var(--accent-soft)] text-[var(--accent)]"
              aria-label="افزودن کلمه کلیدی منفی"
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} />
            </Pressable>
          </div>
        </div>

        <div className="ios-list-row">
          <Pressable
            type="submit"
            onClick={handleSaveProfile}
            className="ios-btn ios-btn-primary h-11 w-full text-[15px]"
          >
            <Save className="h-4 w-4" strokeWidth={1.75} />
            <span>{t.save_profile}</span>
          </Pressable>
        </div>
      </SettingsGroup>

      {/* ---------------------------------------------------------- */}
      {/* Sources                                                     */}
      {/* ---------------------------------------------------------- */}
      <SettingsGroup title="منابع و فیدها" footer={t.sources_desc}>
        {isAddingSource && (
          <form onSubmit={handleAddSource} className="ios-list-row flex-col items-stretch gap-2">
            <input
              type="text"
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              placeholder={t.source_name}
              className="ios-field"
              required
            />
            <input
              type="url"
              value={newSourceUrl}
              onChange={(e) => setNewSourceUrl(e.target.value)}
              placeholder={t.source_url}
              className="ios-field"
              required
            />
            <select
              value={newSourceKind}
              onChange={(e) => setNewSourceKind(e.target.value as Source['kind'])}
              className="ios-field"
              aria-label={t.source_kind}
            >
              <option value="rss">RSS Feed</option>
              <option value="job_api">Job Board API</option>
              <option value="telegram_channel">Telegram Channel</option>
              <option value="newsletter">Email Newsletter</option>
            </select>
            <div className="flex items-center gap-2">
              <Pressable type="submit" className="ios-btn ios-btn-primary h-11 flex-1 text-[14px]">
                افزودن منبع
              </Pressable>
              <Pressable
                onClick={() => setIsAddingSource(false)}
                className="ios-btn ios-btn-secondary h-11 px-4 text-[14px]"
              >
                انصراف
              </Pressable>
            </div>
          </form>
        )}

        {sources.map((src) => (
          <div key={src.id} className="ios-list-row">
            <span
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px]"
              style={{ background: 'var(--fill-quaternary)', color: 'var(--text-secondary)' }}
              aria-hidden="true"
            >
              <Rss className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="ios-row-title truncate">{src.name}</p>
              <p className="ios-row-subtitle truncate" dir="ltr">
                {src.url}
              </p>
            </div>
            <Switch
              checked={src.enabled}
              onChange={() => handleToggleSource(src)}
              label={`فعال‌سازی منبع ${src.name}`}
            />
            <Pressable
              onClick={() => handleDeleteSource(src.id)}
              className="ios-icon-button h-9 w-9 shrink-0 text-[var(--danger)]"
              aria-label={`حذف منبع ${src.name}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </Pressable>
          </div>
        ))}

        <div className="ios-list-row">
          <Pressable
            onClick={() => setIsAddingSource((v) => !v)}
            className="ios-btn ios-btn-secondary h-11 w-full text-[15px]"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            <span>{t.add_source}</span>
          </Pressable>
        </div>
      </SettingsGroup>

      {/* ---------------------------------------------------------- */}
      {/* Schedule                                                    */}
      {/* ---------------------------------------------------------- */}
      <SettingsGroup
        title="زمان‌بندی و حساسیت اعلان‌ها"
        footer="زمان اجرای روزانه خلاصه اخبار و رادار فرصت‌های شغلی، و حداقل امتیاز لازم برای ارسال اعلان."
      >
        <div className="ios-list-row">
          <span
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px]"
            style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}
            aria-hidden="true"
          >
            <Clock className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="ios-row-title">ساعت خلاصه اخبار</p>
          </div>
          <input
            type="time"
            value={settings.news_digest_time}
            onChange={(e) => setSettings({ ...settings, news_digest_time: e.target.value })}
            className="ios-field h-10 w-[112px] shrink-0 text-[13px]"
            aria-label="ساعت خلاصه اخبار"
          />
        </div>

        <div className="ios-list-row">
          <span
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px]"
            style={{ background: 'var(--success-soft)', color: 'var(--success)' }}
            aria-hidden="true"
          >
            <Bell className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="ios-row-title">ساعت رادار شغل</p>
          </div>
          <input
            type="time"
            value={settings.job_radar_time}
            onChange={(e) => setSettings({ ...settings, job_radar_time: e.target.value })}
            className="ios-field h-10 w-[112px] shrink-0 text-[13px]"
            aria-label="ساعت رادار شغل"
          />
        </div>

        <div className="ios-list-row">
          <div className="min-w-0 flex-1">
            <p className="ios-row-title">حداقل امتیاز برای اعلان</p>
            <p className="ios-row-subtitle">آگهی‌های زیر این حد ارسال نمی‌شوند</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Pressable
              onClick={() => adjustScore(-5)}
              className="ios-icon-button h-9 w-9"
              aria-label="کاهش حداقل امتیاز"
            >
              <Minus className="h-4 w-4" strokeWidth={1.75} />
            </Pressable>
            <span className="min-w-[46px] text-center text-[15px] font-semibold text-[var(--text-primary)] tabular">
              {formatPercent(settings.min_job_score_notify)}
            </span>
            <Pressable
              onClick={() => adjustScore(5)}
              className="ios-icon-button h-9 w-9"
              aria-label="افزایش حداقل امتیاز"
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} />
            </Pressable>
          </div>
        </div>

        <div className="ios-list-row">
          <Pressable
            onClick={handleSaveSettings}
            className="ios-btn ios-btn-primary h-11 w-full text-[15px]"
          >
            <Save className="h-4 w-4" strokeWidth={1.75} />
            <span>{t.save_settings}</span>
          </Pressable>
        </div>
      </SettingsGroup>

      {/* ---------------------------------------------------------- */}
      {/* Appearance                                                  */}
      {/* ---------------------------------------------------------- */}
      <SettingsGroup title="ظاهر" footer="حالت «خودکار» از تنظیمات سیستم پیروی می‌کند.">
        <div className="ios-list-row">
          <span
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px]"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
            aria-hidden="true"
          >
            <Palette className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="ios-row-title">پوسته</p>
          </div>
        </div>
        <div className="ios-list-row">
          <div className="w-full">
            <SegmentedControl
              items={[
                { id: 'system', label: 'خودکار' },
                { id: 'light', label: 'روشن' },
                { id: 'dark', label: 'تاریک' },
              ]}
              value={theme}
              onChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
              ariaLabel="پوسته برنامه"
            />
          </div>
        </div>
      </SettingsGroup>

      {/* ---------------------------------------------------------- */}
      {/* Telegram bot                                                */}
      {/* ---------------------------------------------------------- */}
      <SettingsGroup
        title="ربات تلگرام"
        footer="ثبت خودکار ایده‌ها، لینک‌های گیت‌هاب و یادداشت‌های فنی با تحلیل هوش مصنوعی."
      >
        <div className="ios-list-row">
          <span
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px]"
            style={{ background: 'var(--info)', color: 'var(--on-accent)' }}
            aria-hidden="true"
          >
            <Send className="h-4 w-4 -rotate-12" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="ios-row-title truncate">@{(telegramStatus?.bot_username ?? 'hub_bot').replace(/^@/, '')}</p>
            <p className="ios-row-subtitle">شناسه مالک: {telegramStatus?.owner_chat_id ?? '••••••'}</p>
          </div>
          <a
            href="https://t.me/knowledgehubpwabot"
            target="_blank"
            rel="noopener noreferrer"
            className="ios-icon-button h-9 w-9 shrink-0 text-[var(--accent)]"
            aria-label="باز کردن ربات تلگرام"
          >
            <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
          </a>
        </div>

        <div className="ios-list-row">
          <div className="min-w-0 flex-1">
            <p className="ios-row-title">موتور استخراج</p>
            <p className="ios-row-subtitle">تحلیل ساختاریافته پیام‌ها</p>
          </div>
          <span className="ios-chip h-[24px] min-h-[24px] px-2 text-[10px]" data-tone="accent">
            <Sparkles className="h-3 w-3" strokeWidth={1.75} />
            هوش مصنوعی
          </span>
        </div>

        <div className="ios-list-row gap-2">
          <Pressable
            onClick={handleSyncTelegram}
            disabled={syncingTelegram}
            className="ios-btn ios-btn-secondary h-11 flex-1 text-[13px] disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${syncingTelegram ? 'animate-spin' : ''}`}
              strokeWidth={1.75}
            />
            <span>{syncingTelegram ? 'در حال بررسی...' : 'همگام‌سازی'}</span>
          </Pressable>
          <Pressable
            onClick={handleSimulateTelegram}
            disabled={simulatingTelegram}
            className="ios-btn ios-btn-secondary h-11 flex-1 text-[13px] disabled:opacity-50"
          >
            <Sparkles
              className={`h-4 w-4 ${simulatingTelegram ? 'animate-pulse' : ''}`}
              strokeWidth={1.75}
            />
            <span>تست ثبت نمونه</span>
          </Pressable>
        </div>
      </SettingsGroup>

      {/* ---------------------------------------------------------- */}
      {/* Backend connection                                          */}
      {/* ---------------------------------------------------------- */}
      <SettingsGroup
        title={t.api_config_title}
        footer="در صورت خالی بودن آدرس، داده‌ی پیش‌فرض محلی (Mock) استفاده می‌شود."
      >
        <div className="ios-list-row">
          <span
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px]"
            style={{ background: 'var(--success-soft)', color: 'var(--success)' }}
            aria-hidden="true"
          >
            <Server className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="ios-row-title">وضعیت اتصال</p>
            <p className="ios-row-subtitle" style={{ color: connectionColor[connection] }}>
              {connectionLabel[connection]}
            </p>
          </div>
          {connection === 'connected' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--success)]" strokeWidth={1.75} />
          ) : connection === 'offline' ? (
            <CircleAlert className="h-5 w-5 shrink-0 text-[var(--danger)]" strokeWidth={1.75} />
          ) : (
            <ChevronLeft className="h-5 w-5 shrink-0 text-[var(--text-quaternary)]" strokeWidth={1.75} />
          )}
        </div>

        <div className="ios-list-row">
          <div className="min-w-0 flex-1">
            <p className="ios-row-title">{t.api_url_label}</p>
          </div>
          <input
            type="text"
            value={settings.api_url}
            onChange={(e) => setSettings({ ...settings, api_url: e.target.value })}
            placeholder="https://your-domain.com"
            className="ios-field h-10 w-[170px] shrink-0 text-[13px]"
            dir="ltr"
          />
        </div>

        <div className="ios-list-row">
          <div className="min-w-0 flex-1">
            <p className="ios-row-title">{t.api_token_label}</p>
          </div>
          <input
            type={showToken ? 'text' : 'password'}
            value={settings.app_token}
            onChange={(e) => setSettings({ ...settings, app_token: e.target.value })}
            placeholder="—"
            className="ios-field h-10 w-[140px] shrink-0 text-[13px]"
            dir="ltr"
          />
          <Pressable
            onClick={() => setShowToken((v) => !v)}
            className="ios-icon-button h-9 w-9 shrink-0"
            aria-label={showToken ? 'پنهان کردن توکن' : 'نمایش توکن'}
          >
            {showToken ? (
              <EyeOff className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={1.75} />
            )}
          </Pressable>
        </div>

        <div className="ios-list-row gap-2">
          <Pressable
            onClick={testConnection}
            disabled={connection === 'checking'}
            className="ios-btn ios-btn-secondary h-11 flex-1 text-[13px] disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${connection === 'checking' ? 'animate-spin' : ''}`}
              strokeWidth={1.75}
            />
            <span>تست اتصال</span>
          </Pressable>
          <Pressable
            onClick={handleSaveSettings}
            className="ios-btn ios-btn-primary h-11 flex-1 text-[13px]"
          >
            <Save className="h-4 w-4" strokeWidth={1.75} />
            <span>{t.save_settings}</span>
          </Pressable>
        </div>
      </SettingsGroup>
    </div>
  );
};
