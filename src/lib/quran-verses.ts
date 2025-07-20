
import type { Ayah, WordTiming } from '@/types';

const localVerses: Record<number, Omit<Ayah, 'translation'>[]> = {
  1: [
    { "id": 1, "verse_key": "1:1", "text_uthmani": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", "page": 1, "juz": 1 },
    { "id": 2, "verse_key": "1:2", "text_uthmani": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ", "page": 1, "juz": 1 },
    { "id": 3, "verse_key": "1:3", "text_uthmani": "ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", "page": 1, "juz": 1 },
    { "id": 4, "verse_key": "1:4", "text_uthmani": "مَـٰلِكِ يَوْمِ ٱلدِّينِ", "page": 1, "juz": 1 },
    { "id": 5, "verse_key": "1:5", "text_uthmani": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", "page": 1, "juz": 1 },
    { "id": 6, "verse_key": "1:6", "text_uthmani": "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ", "page": 1, "juz": 1 },
    { "id": 7, "verse_key": "1:7", "text_uthmani": "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ", "page": 1, "juz": 1 }
  ],
  // Other surahs can be added here
};

export function getLocalVersesForSurah(surahId: number): Omit<Ayah, 'translation'>[] | undefined {
  return localVerses[surahId];
}

const localWordTimings: Record<string, WordTiming[]> = {
    "1:1": [
        {"word_position":1,"timestamp_from":79,"timestamp_to":379,"text_uthmani":"بِسْمِ","audio_url":"/recitations/mishary_al_afasy/128/1_1.mp3"},
        {"word_position":2,"timestamp_from":379,"timestamp_to":849,"text_uthmani":"ٱللَّهِ","audio_url":"/recitations/mishary_al_afasy/128/1_1.mp3"},
        {"word_position":3,"timestamp_from":849,"timestamp_to":1779,"text_uthmani":"ٱلرَّحْمَـٰنِ","audio_url":"/recitations/mishary_al_afasy/128/1_1.mp3"},
        {"word_position":4,"timestamp_from":1779,"timestamp_to":2569,"text_uthmani":"ٱلرَّحِيمِ","audio_url":"/recitations/mishary_al_afasy/128/1_1.mp3"}
    ],
    "1:2": [
        {"word_position":1,"timestamp_from":629,"timestamp_to":1249,"text_uthmani":"ٱلْحَمْدُ","audio_url":"/recitations/mishary_al_afasy/128/1_2.mp3"},
        {"word_position":2,"timestamp_from":1249,"timestamp_to":1619,"text_uthmani":"لِلَّهِ","audio_url":"/recitations/mishary_al_afasy/128/1_2.mp3"},
        {"word_position":3,"timestamp_from":1619,"timestamp_to":2029,"text_uthmani":"رَبِّ","audio_url":"/recitations/mishary_al_afasy/128/1_2.mp3"},
        {"word_position":4,"timestamp_from":2029,"timestamp_to":2819,"text_uthmani":"ٱلْعَـٰلَمِينَ","audio_url":"/recitations/mishary_al_afasy/128/1_2.mp3"}
    ],
    "1:3": [
        {"word_position":1,"timestamp_from":381,"timestamp_to":1261,"text_uthmani":"ٱلرَّحْمَـٰنِ","audio_url":"/recitations/mishary_al_afasy/128/1_3.mp3"},
        {"word_position":2,"timestamp_from":1261,"timestamp_to":2071,"text_uthmani":"ٱلرَّحِيمِ","audio_url":"/recitations/mishary_al_afasy/128/1_3.mp3"}
    ],
    "1:4": [
        {"word_position":1,"timestamp_from":463,"timestamp_to":943,"text_uthmani":"مَـٰلِكِ","audio_url":"/recitations/mishary_al_afasy/128/1_4.mp3"},
        {"word_position":2,"timestamp_from":943,"timestamp_to":1343,"text_uthmani":"يَوْمِ","audio_url":"/recitations/mishary_al_afasy/128/1_4.mp3"},
        {"word_position":3,"timestamp_from":1343,"timestamp_to":2023,"text_uthmani":"ٱلدِّينِ","audio_url":"/recitations/mishary_al_afasy/128/1_4.mp3"}
    ],
    "1:5": [
        {"word_position":1,"timestamp_from":626,"timestamp_to":1246,"text_uthmani":"إِيَّاكَ","audio_url":"/recitations/mishary_al_afasy/128/1_5.mp3"},
        {"word_position":2,"timestamp_from":1246,"timestamp_to":1896,"text_uthmani":"نَعْبُدُ","audio_url":"/recitations/mishary_al_afasy/128/1_5.mp3"},
        {"word_position":3,"timestamp_from":1896,"timestamp_to":2396,"text_uthmani":"وَإِيَّاكَ","audio_url":"/recitations/mishary_al_afasy/128/1_5.mp3"},
        {"word_position":4,"timestamp_from":2396,"timestamp_to":3256,"text_uthmani":"نَسْتَعِينُ","audio_url":"/recitations/mishary_al_afasy/128/1_5.mp3"}
    ],
    "1:6": [
        {"word_position":1,"timestamp_from":474,"timestamp_to":994,"text_uthmani":"ٱهْدِنَا","audio_url":"/recitations/mishary_al_afasy/128/1_6.mp3"},
        {"word_position":2,"timestamp_from":994,"timestamp_to":1614,"text_uthmani":"ٱلصِّرَٰطَ","audio_url":"/recitations/mishary_al_afasy/128/1_6.mp3"},
        {"word_position":3,"timestamp_from":1614,"timestamp_to":2584,"text_uthmani":"ٱلْمُسْتَقِيمَ","audio_url":"/recitations/mishary_al_afasy/128/1_6.mp3"}
    ],
    "1:7": [
        {"word_position":1,"timestamp_from":518,"timestamp_to":1058,"text_uthmani":"صِرَٰطَ","audio_url":"/recitations/mishary_al_afasy/128/1_7.mp3"},
        {"word_position":2,"timestamp_from":1058,"timestamp_to":1558,"text_uthmani":"ٱلَّذِينَ","audio_url":"/recitations/mishary_al_afasy/128/1_7.mp3"},
        {"word_position":3,"timestamp_from":1558,"timestamp_to":2228,"text_uthmani":"أَنْعَمْتَ","audio_url":"/recitations/mishary_al_afasy/128/1_7.mp3"},
        {"word_position":4,"timestamp_from":2228,"timestamp_to":2918,"text_uthmani":"عَلَيْهِمْ","audio_url":"/recitations/mishary_al_afasy/128/1_7.mp3"},
        {"word_position":5,"timestamp_from":2918,"timestamp_to":3428,"text_uthmani":"غَيْرِ","audio_url":"/recitations/mishary_al_afasy/128/1_7.mp3"},
        {"word_position":6,"timestamp_from":3428,"timestamp_to":4218,"text_uthmani":"ٱلْمَغْضُوبِ","audio_url":"/recitations/mishary_al_afasy/128/1_7.mp3"},
        {"word_position":7,"timestamp_from":4218,"timestamp_to":4898,"text_uthmani":"عَلَيْهِمْ","audio_url":"/recitations/mishary_al_afasy/128/1_7.mp3"},
        {"word_position":8,"timestamp_from":4898,"timestamp_to":5378,"text_uthmani":"وَلَا","audio_url":"/recitations/mishary_al_afasy/128/1_7.mp3"},
        {"word_position":9,"timestamp_from":5378,"timestamp_to":6608,"text_uthmani":"ٱلضَّآلِّينَ","audio_url":"/recitations/mishary_al_afasy/128/1_7.mp3"}
    ]
}

export function getLocalWordTimings(verseKey: string): WordTiming[] | undefined {
    return localWordTimings[verseKey];
}
