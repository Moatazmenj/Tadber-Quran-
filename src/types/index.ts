export interface Surah {
  id: number;
  name: string;
  arabicName: string;
  revelationPlace: 'Makkah' | 'Madinah';
  versesCount: number;
  juz: number[];
}

export interface Ayah {
  id: number;
  verse_key: string;
  text_uthmani: string;
  translation?: string;
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
  audio_url: string;
}

export interface Reciter {
  id: number;
  name: string;
  style: string | null;
}
