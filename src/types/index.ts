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
  translation_en: string;
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
  language: string;
  nativeName: string;
  translator: string;
  flag: string;
}
