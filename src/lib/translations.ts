import type { TranslationOption } from '@/types';

export const translationOptions: TranslationOption[] = [
    { id: 'hi', language: 'Hindi', nativeName: 'हिंदी', translator: 'Muhammad Farooq Khan and Muhammad Ahmed', flag: '🇮🇳' },
    { id: 'ur', language: 'Urdu', nativeName: 'اردو', translator: 'Fateh Muhammad Jalandhry', flag: '🇵🇰' },
    { id: 'id', language: 'Bahasa Indonesia', nativeName: 'Bahasa Indonesia', translator: 'Indonesian Ministry of Religious Affairs', flag: '🇮🇩' },
    { id: 'tr', language: 'Türkçe', nativeName: 'Türkçe', translator: 'Diyanet Isleri', flag: '🇹🇷' },
    { id: 'zh', language: 'Chinese', nativeName: '简体中文', translator: 'Ma Jian', flag: '🇨🇳' },
    { id: 'bn', language: 'Bengali', nativeName: 'বাংলা', translator: 'Zohurul Hoque', flag: '🇧🇩' },
    { id: 'fr', language: 'Français', nativeName: 'Français', translator: 'Muhammad Hamidullah', flag: '🇫🇷' },
    { id: 'en', language: 'English', nativeName: 'English', translator: 'Saheeh International', flag: '🇬🇧' },
];

// This is a mock list to match the visual representation in the image.
export const downloadedTranslations = ['zh', 'en'];
