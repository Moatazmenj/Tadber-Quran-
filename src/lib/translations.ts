import type { TranslationOption } from '@/types';

export const translationOptions: TranslationOption[] = [
    { id: 'hi', apiId: 85, language: 'Hindi', nativeName: 'हिंदी', translator: 'Muhammad Farooq Khan and Muhammad Ahmed', flag: '🇮🇳' },
    { id: 'ur', apiId: 819, language: 'Urdu', nativeName: 'اردو', translator: 'Fateh Muhammad Jalandhry', flag: '🇵🇰' },
    { id: 'id', apiId: 33, language: 'Bahasa Indonesia', nativeName: 'Bahasa Indonesia', translator: 'Indonesian Ministry of Religious Affairs', flag: '🇮🇩' },
    { id: 'tr', apiId: 44, language: 'Türkçe', nativeName: 'Türkçe', translator: 'Diyanet Isleri', flag: '🇹🇷' },
    { id: 'zh', apiId: 19, language: 'Chinese', nativeName: '简体中文', translator: 'Ma Jian', flag: '🇨🇳' },
    { id: 'bn', apiId: 17, language: 'Bengali', nativeName: 'বাংলা', translator: 'Zohurul Hoque', flag: '🇧🇩' },
    { id: 'fr', apiId: 22, language: 'Français', nativeName: 'Français', translator: 'Muhammad Hamidullah', flag: '🇫🇷' },
    { id: 'en', apiId: 131, language: 'English', nativeName: 'English', translator: 'Saheeh International', flag: '🇬🇧' },
];

// This is a mock list to match the visual representation in the image.
export const downloadedTranslations = ['zh', 'en'];
