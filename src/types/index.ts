

export interface Surah {
  id: number;
  name: string;
  arabicName: string;
  revelationPlace: 'Makkah' | 'Madinah';
  revelationPlaceTranslations: {
    en: string;
    ar: string;
    fr: string;
    es: string;
    id: string;
    ru: string;
    ur: string;
  };
  versesCount: number;
  juz: number[];
}

export interface Ayah {
  id: number;
  verse_key: string;
  text_uthmani: string;
  translation?: string;
  juz?: number;
  page?: number;
  isActive?: boolean;
}

export interface Juz {
  id: number;
  juz_number: number;
  verse_mapping: {
    [key: string]: string;
  };
}

export interface TranslationOption {
  id: string;
  apiId: number;
  language: string;
  nativeName: string;
  translator: string;
  flag: string;
  isActive?: boolean;
}

export interface ThemeOption {
  id: string;
  name: string;
  previewImage: string;
  backgroundImage: string;
}

export interface AudioFile {
  id: number;
  verse_key: string;
  url: string;
}

export interface Reciter {
  id: number;
  name: string;
  style: string | null;
  imageUrl: string | null;
  server: string;
}

export interface WordTiming {
  word_position: number;
  timestamp_from: number;
  timestamp_to: number;
  text_uthmani: string;
  audio_url: string;
}
