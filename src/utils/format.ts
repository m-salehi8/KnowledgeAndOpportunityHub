// Persian Jalali conversion and date formatting utilities

export function toPersianDigits(input: string | number): string {
  const str = String(input);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (char) => persianDigits[Number(char)]);
}

export function formatPercent(input: string | number): string {
  return `${toPersianDigits(input)}٪`;
}

export function normalizeTag(tag: string): string {
  return tag.replace(/^#+/, '').replace(/#+$/, '').trim();
}

/**
 * Converts a Gregorian date (year, month 1-12, day 1-31) to Jalali [jy, jm, jd]
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return [jy, jm, jd];
}

const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

const ENGLISH_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function formatRelativeTime(
  isoDateString: string,
  lang: 'fa' | 'en' = 'fa',
  nowOverride?: Date
): string {
  const date = new Date(isoDateString);
  const now = nowOverride || new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (lang === 'fa') {
    if (diffSec < 60) return 'چند لحظه پیش';
    if (diffMin < 60) return `${toPersianDigits(diffMin)} دقیقه پیش`;
    if (diffHours < 24) return `${toPersianDigits(diffHours)} ساعت پیش`;
    if (diffDays === 1) return 'دیروز';
    if (diffDays < 7) return `${toPersianDigits(diffDays)} روز پیش`;
    if (diffDays < 30) return `${toPersianDigits(Math.floor(diffDays / 7))} هفته پیش`;

    // Jalali formatted date
    const [jy, jm, jd] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return `${toPersianDigits(jd)} ${PERSIAN_MONTHS[jm - 1]} ${toPersianDigits(jy)}`;
  } else {
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

    return `${date.getDate()} ${ENGLISH_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  }
}

export function formatExactDate(isoDateString: string, lang: 'fa' | 'en' = 'fa'): string {
  const date = new Date(isoDateString);
  if (lang === 'fa') {
    const [jy, jm, jd] = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const hours = toPersianDigits(String(date.getHours()).padStart(2, '0'));
    const minutes = toPersianDigits(String(date.getMinutes()).padStart(2, '0'));
    return `${toPersianDigits(jd)} ${PERSIAN_MONTHS[jm - 1]} ${toPersianDigits(jy)}، ساعت ${hours}:${minutes}`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
