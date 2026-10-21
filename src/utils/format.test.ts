import test from 'node:test';
import assert from 'node:assert/strict';
import { toPersianDigits, gregorianToJalali, formatRelativeTime } from './format';

test('toPersianDigits converts ASCII numbers to Persian numerals', () => {
  assert.equal(toPersianDigits(12345), '۱۲۳۴۵');
  assert.equal(toPersianDigits('Job score: 95%'), 'Job score: ۹۵%');
});

test('gregorianToJalali accurately converts Gregorian dates to Jalali', () => {
  // 2026-03-21 is 1405-01-01 (Nowruz)
  const [jy, jm, jd] = gregorianToJalali(2026, 3, 21);
  assert.equal(jy, 1405);
  assert.equal(jm, 1);
  assert.equal(jd, 1);
});

test('formatRelativeTime produces accurate localized relative strings', () => {
  const base = new Date('2026-10-21T12:00:00Z');

  // 10 minutes ago
  const t1 = new Date('2026-10-21T11:50:00Z').toISOString();
  assert.equal(formatRelativeTime(t1, 'fa', base), '۱۰ دقیقه پیش');
  assert.equal(formatRelativeTime(t1, 'en', base), '10m ago');

  // 3 hours ago
  const t2 = new Date('2026-10-21T09:00:00Z').toISOString();
  assert.equal(formatRelativeTime(t2, 'fa', base), '۳ ساعت پیش');
  assert.equal(formatRelativeTime(t2, 'en', base), '3h ago');

  // 1 day ago
  const t3 = new Date('2026-10-20T12:00:00Z').toISOString();
  assert.equal(formatRelativeTime(t3, 'fa', base), 'دیروز');
  assert.equal(formatRelativeTime(t3, 'en', base), 'Yesterday');
});
