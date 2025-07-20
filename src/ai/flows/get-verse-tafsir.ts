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
  targetLanguage: z.string().optional().default('Arabic').describe('The target language for the Tafsir. Can be "Arabic" or "English".'),
});
export type GetVerseTafsirInput = z.infer<typeof GetVerseTafsirInputSchema>;

const GetVerseTafsirOutputSchema = z.object({
  tafsir: z.string().describe('A concise interpretation (Tafsir) of the verse, explaining its meaning, context, and key lessons.'),
});
export type GetVerseTafsirOutput = z.infer<typeof GetVerseTafsirOutputSchema>;

export async function getVerseTafsir(input: GetVerseTafsirInput): Promise<GetVerseTafsirOutput> {
  return getVerseTafsirFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getVerseTafsirPrompt',
  input: {schema: GetVerseTafsirInputSchema},
  output: {schema: GetVerseTafsirOutputSchema},
  prompt: `You are an expert in Islamic studies, specializing in Quranic interpretation (Tafsir). Your task is to provide a clear and concise Tafsir for the given Quranic verse. The entire response must be in {{targetLanguage}}.

  Surah: {{surahName}}
  Verse: {{verseNumber}}
  Arabic Text: {{verseText}}
  English Translation: {{verseTranslation}}

  Your Tafsir should explain the meaning, context, and key lessons of the verse. Keep the explanation accessible to a general audience.`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
       {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
       {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
});

const getVerseTafsirFlow = ai.defineFlow(
  {
    name: 'getVerseTafsirFlow',
    inputSchema: GetVerseTafsirInputSchema,
    outputSchema: GetVerseTafsirOutputSchema,
    cache: {},
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a valid Tafsir. This may be due to content safety filters.");
    }
    return output;
  }
);
