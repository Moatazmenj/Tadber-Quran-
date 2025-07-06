import type { Ayah } from '@/types';

const localVerses: Record<number, Ayah[]> = {
  1: [
    { "id": 1, "verse_key": "1:1", "text_uthmani": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", "translation_en": "In the name of Allah, the Entirely Merciful, the Especially Merciful." },
    { "id": 2, "verse_key": "1:2", "text_uthmani": "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ", "translation_en": "[All] praise is [due] to Allah, Lord of the worlds -" },
    { "id": 3, "verse_key": "1:3", "text_uthmani": "ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", "translation_en": "The Entirely Merciful, the Especially Merciful," },
    { "id": 4, "verse_key": "1:4", "text_uthmani": "مَـٰلِكِ يَوْمِ ٱلدِّينِ", "translation_en": "Sovereign of the Day of Recompense." },
    { "id": 5, "verse_key": "1:5", "text_uthmani": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", "translation_en": "It is You we worship and You we ask for help." },
    { "id": 6, "verse_key": "1:6", "text_uthmani": "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ", "translation_en": "Guide us to the straight path -" },
    { "id": 7, "verse_key": "1:7", "text_uthmani": "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ", "translation_en": "The path of those upon whom You have bestowed favor, not of those who have earned [Your] anger or of those who are astray." }
  ]
};

export function getLocalVersesForSurah(surahId: number): Ayah[] | undefined {
  return localVerses[surahId];
}
