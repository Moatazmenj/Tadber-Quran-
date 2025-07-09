import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toArabicNumerals(num: string | number): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num)
    .split('')
    .map((digit) => arabicNumerals[parseInt(digit, 10)] ?? digit)
    .join('');
}

export function normalizeArabic(text: string): string {
  if (!text) return '';
  // Remove Tashkeel, Tatweel, and other formatting characters
  return text
    .replace(/[\u064B-\u0652\u0670]/g, '') // Tashkeel (diacritics) and Alef Khanjariya
    .replace(/ـ/g, '') // Tatweel
    .replace(/[أإآ]/g, 'ا') // Normalize Alef
    .replace(/ى/g, 'ي') // Normalize Yaa to dotless Yaa
    .replace(/ة/g, 'ه') // Normalize Taa Marbuta
    .replace(/ٱ/g, 'ا') // Normalize Hamzat Wasl
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}
