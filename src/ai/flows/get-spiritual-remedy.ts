'use server';
/**
 * @fileOverview Provides a spiritual remedy from the Quran based on user's feelings.
 *
 * - getSpiritualRemedy - A function that suggests Quranic verses, provides tafsir, a dua, and a recitation suggestion.
 * - SpiritualRemedyInput - The input type for the getSpiritualRemedy function.
 * - SpiritualRemedyOutput - The return type for the getSpiritualRemedy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { reciters } from '@/lib/reciters';
import { surahs } from '@/lib/quran';

const SpiritualRemedyInputSchema = z.object({
  feeling: z.string().describe('The user’s description of their current feeling or situation.'),
  language: z.string().optional().default('Arabic').describe('The target language for the remedy (e.g., "English", "Arabic", "French").'),
});
export type SpiritualRemedyInput = z.infer<typeof SpiritualRemedyInputSchema>;

const SpiritualRemedyOutputSchema = z.object({
  verses: z.array(z.object({
    verse_key: z.string().describe('The reference of the verse (e.g., "3:139").'),
    text: z.string().describe('The Arabic text of the verse.'),
  })).describe('An array of 1-3 Quranic verses suitable for the user’s feeling.'),
  tafsir: z.string().describe('A brief and gentle interpretation of the suggested verses, connecting them to the user’s feeling.'),
  dua: z.string().describe('A relevant and comforting supplication (Dua) from the Quran or Sunnah.'),
  recitationSuggestion: z.object({
    surahId: z.number().describe('The ID of the Surah recommended for listening.'),
    surahName: z.string().describe('The name of a Surah recommended for listening.'),
    reciterId: z.number().describe('The ID of a reciter known for an emotional and touching recitation style.'),
    reciterName: z.string().describe('The name of a reciter known for an emotional and touching recitation style (e.g., Yasser Ad-Dussary).'),
  }).describe('A suggestion for a Surah and a reciter to listen to for comfort.'),
});
export type SpiritualRemedyOutput = z.infer<typeof SpiritualRemedyOutputSchema>;

export async function getSpiritualRemedy(input: SpiritualRemedyInput): Promise<SpiritualRemedyOutput> {
  return getSpiritualRemedyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getSpiritualRemedyPrompt',
  input: {schema: SpiritualRemedyInputSchema},
  output: {schema: z.object({
    verses: z.array(z.object({
      verse_key: z.string().describe('The reference of the verse (e.g., "3:139").'),
      text: z.string().describe('The Arabic text of the verse.'),
    })),
    tafsir: z.string(),
    dua: z.string(),
    recitationSuggestion: z.object({
      surahName: z.string(),
      reciterName: z.string(),
    }),
  })},
  prompt: `You are a spiritual guide and a scholar of the Quran and the human psyche in a "Quranic Clinic." Your task is to deeply understand the Muslim user's feelings and provide a comprehensive and precise faith-based prescription from the Holy Quran. Your entire response, including tafsir, dua, and the recitation suggestion text, must be in {{language}}.

  User's feeling: "{{feeling}}"

  Analyze this feeling from an Islamic perspective. Consider concepts related to it such as patience (Sabr), contentment (Rida), certainty (Yaqeen), fear (Khawf), hope (Raja'), and reliance on Allah (Tawakkul).

  Based on this deep understanding, provide the following:
  1.  **Verses of Tranquility:** Meticulously select 1 to 3 Quranic verses that serve as a direct remedy and solace for the situation. Provide the verse text in Arabic, along with its reference (e.g., "3:139").
  2.  **Gentle & Insightful Tafsir:** Provide an interpretation of the suggested verses that touches the heart. Do not just give a literal explanation; connect the meaning to the user's life and feelings, highlighting the message of hope and serenity within them and how they can be practically applied. Make the tafsir rich with wisdom and broad understanding.
  3.  **A Fitting Supplication (Dua):** Choose a relevant and impactful Dua from the Quran or Sunnah that perfectly suits the user's condition and opens the door for conversation with Allah.
  4.  **Listening Recommendation:** Suggest a Surah for an emotional recitation, along with the name of a reciter known for their touching and heartfelt recitation style (like Yasser Ad-Dussary or Mishary Alafasy) to deepen the spiritual impact and achieve tranquility.

  All text in the output (tafsir, dua, recitation suggestion) must be in the target language: {{language}}.`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
});

const getSpiritualRemedyFlow = ai.defineFlow(
  {
    name: 'getSpiritualRemedyFlow',
    inputSchema: SpiritualRemedyInputSchema,
    outputSchema: SpiritualRemedyOutputSchema,
    cache: {},
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a valid response. Please try rephrasing your feeling.");
    }
    
    // Find Surah and Reciter IDs
    const suggestedSurah = surahs.find(s => s.name.toLowerCase() === output.recitationSuggestion.surahName.toLowerCase());
    const suggestedReciter = reciters.find(r => r.name.toLowerCase().includes(output.recitationSuggestion.reciterName.toLowerCase()));

    // Fallback to defaults if not found
    const surahId = suggestedSurah ? suggestedSurah.id : 36; // Ya-Sin
    const reciterId = suggestedReciter ? suggestedReciter.id : 11; // Yasser Ad-Dussary

    return {
        ...output,
        recitationSuggestion: {
            surahId: surahId,
            surahName: suggestedSurah?.name || 'Ya-Sin',
            reciterId: reciterId,
            reciterName: suggestedReciter?.name || 'Yasser Ad-Dussary'
        }
    };
  }
);
