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
  ],
  3: [
    { "id": 1, "verse_key": "3:1", "text_uthmani": "الٓمٓ", "translation_en": "Alif, Lam, Meem." },
    { "id": 2, "verse_key": "3:2", "text_uthmani": "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ", "translation_en": "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence." },
    { "id": 3, "verse_key": "3:3", "text_uthmani": "نَزَّلَ عَلَيْكَ ٱلْكِتَـٰبَ بِٱلْحَقِّ مُصَدِّقًا لِّمَا بَيْنَ يَدَيْهِ وَأَنزَلَ ٱلتَّوْرَىٰةَ وَٱلْإِنجِيلَ", "translation_en": "He has sent down upon you, [O Muhammad], the Book in truth, confirming what was before it. And He revealed the Torah and the Gospel." },
    { "id": 4, "verse_key": "3:4", "text_uthmani": "مِن قَبْلُ هُدًى لِّلنَّاسِ وَأَنزَلَ ٱلْفُرْقَانَ ۗ إِنَّ ٱلَّذِينَ كَفَرُوا۟ بِـَٔايَـٰتِ ٱللَّهِ لَهُمْ عَذَابٌ شَدِيدٌ ۗ وَٱللَّهُ عَزِيزٌ ذُو ٱنتِقَامٍ", "translation_en": "Before, as guidance for the people. And He revealed the Criterion. Indeed, those who disbelieve in the verses of Allah will have a severe punishment, and Allah is exalted in Might, the Owner of Retribution." },
    { "id": 5, "verse_key": "3:5", "text_uthmani": "إِنَّ ٱللَّهَ لَا يَخْفَىٰ عَلَيْهِ شَىْءٌ فِى ٱلْأَرْضِ وَلَا فِى ٱلسَّمَآءِ", "translation_en": "Indeed, from Allah nothing is hidden in the earth nor in the heaven." }
  ]
};

export function getLocalVersesForSurah(surahId: number): Ayah[] | undefined {
  return localVerses[surahId];
}
