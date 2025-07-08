'use server';

/**
 * @fileOverview Provides Tafsir (interpretation) for a given Quranic verse.
 *
 * - getVerseTafsir - A function that gets the Tafsir for a verse.
 * - GetVerseTafsirInput - The input type for the getVerseTafsir function.
 * - GetVerseTafsirOutput - The return type for the getVerseTafsir function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetVerseTafsirInputSchema = z.object({
  surahName: z.string().describe('The name of the Surah.'),
  verseNumber: z.string().describe('The verse number.'),
  verseText: z.string().describe('The Arabic text of the verse.'),
  verseTranslation: z.string().describe('The English translation of the verse.'),
});
export type GetVerseTafsirInput = z.infer<typeof GetVerseTafsirInputSchema>;

const GetVerseTafsirOutputSchema = z.object({
  tafsir: z.string().describe('A concise interpretation (Tafsir) of the verse, explaining its meaning, context, and key lessons. The response must be in Arabic.'),
});
export type GetVerseTafsirOutput = z.infer<typeof GetVerseTafsirOutputSchema>;

export async function getVerseTafsir(input: GetVerseTafsirInput): Promise<GetVerseTafsirOutput> {
  return getVerseTafsirFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getVerseTafsirPrompt',
  input: {schema: GetVerseTafsirInputSchema},
  output: {schema: GetVerseTafsirOutputSchema},
  prompt: `You are an expert in Islamic studies, specializing in Quranic interpretation (Tafsir). Your task is to provide a clear and concise Tafsir for the given Quranic verse.

  The response must be in Arabic.

  Surah: {{surahName}}
  Verse: {{verseNumber}}
  Arabic Text: {{verseText}}
  English Translation: {{verseTranslation}}

  Please provide a Tafsir that covers the following points:
  1.  The literal meaning of the verse.
  2.  The historical context of its revelation (if known and relevant).
  3.  The key themes and lessons.
  4.  Connections to other verses if applicable.

  Keep the explanation accessible to a general audience. The entire response should be in Arabic.`,
});

const getVerseTafsirFlow = ai.defineFlow(
  {
    name: 'getVerseTafsirFlow',
    inputSchema: GetVerseTafsirInputSchema,
    outputSchema: GetVerseTafsirOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
