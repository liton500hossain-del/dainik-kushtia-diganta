// Bengali Numerals and Date Utilities for Dainik Kushtia Diganta

export const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(num: number | string): string {
  if (num === null || num === undefined) return '';
  return num
    .toString()
    .split('')
    .map(ch => (ch >= '0' && ch <= '9' ? banglaDigits[parseInt(ch, 10)] : ch))
    .join('');
}

export const banglaMonths = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const banglaDays = [
  'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
];

// Bangla Seasonal calendar months
export const banglaSolarMonths = [
  'বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন',
  'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'
];

export function formatBengaliDateTime(dateString?: string | Date): string {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';

  const day = banglaDays[date.getDay()];
  const dateNum = toBengaliNumber(date.getDate());
  const month = banglaMonths[date.getMonth()];
  const year = toBengaliNumber(date.getFullYear());

  let hours = date.getHours();
  const minutes = toBengaliNumber(date.getMinutes().toString().padStart(2, '0'));
  let period = 'সকাল';
  if (hours >= 12 && hours < 15) period = 'দুপুর';
  else if (hours >= 15 && hours < 18) period = 'বিকেল';
  else if (hours >= 18 && hours < 20) period = 'সন্ধ্যা';
  else if (hours >= 20 || hours < 6) period = 'রাত';

  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  const hoursNum = toBengaliNumber(hours);

  return `${day}, ${dateNum} ${month} ${year}, ${period} ${hoursNum}:${minutes}`;
}

export function formatBengaliDateOnly(dateString?: string | Date): string {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return '';
  const day = banglaDays[date.getDay()];
  const dateNum = toBengaliNumber(date.getDate());
  const month = banglaMonths[date.getMonth()];
  const year = toBengaliNumber(date.getFullYear());
  return `${day}, ${dateNum} ${month} ${year}`;
}

export function getFullHeaderDate(): string {
  const now = new Date();
  const day = banglaDays[now.getDay()];
  const dateNum = toBengaliNumber(now.getDate());
  const month = banglaMonths[now.getMonth()];
  const year = toBengaliNumber(now.getFullYear());

  // Approximate Bangla calendar day
  return `${day}, ${dateNum} ${month} ${year}`;
}

export function formatTimeAgoBengali(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'এইমাত্র';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${toBengaliNumber(diffMin)} মিনিট আগে`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${toBengaliNumber(diffHours)} ঘণ্টা আগে`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${toBengaliNumber(diffDays)} দিন আগে`;
  return formatBengaliDateOnly(date);
}
