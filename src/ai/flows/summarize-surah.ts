'use server';

/**
 * @fileOverview Summarizes a given Surah of the Quran.
 *
 * - summarizeSurah - A function that summarizes the Surah.
 * - SummarizeSurahInput - The input type for the summarizeSurah function.
 * - SummarizeSurahOutput - The return type for the summarizeSurah function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSurahInputSchema = z.object({
  surahText: z.string().describe('The text content of the Surah to summarize.'),
  surahName: z.string().describe('The name of the Surah.'),
});
export type SummarizeSurahInput = z.infer<typeof SummarizeSurahInputSchema>;

const SummarizeSurahOutputSchema = z.object({
  summary: z.string().describe('A summary of the Surah.'),
});
export type SummarizeSurahOutput = z.infer<typeof SummarizeSurahOutputSchema>;

export async function summarizeSurah(input: SummarizeSurahInput): Promise<SummarizeSurahOutput> {
  return summarizeSurahFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSurahPrompt',
  input: {schema: SummarizeSurahInputSchema},
  output: {schema: SummarizeSurahOutputSchema},
  prompt: `You are an expert in Islamic studies, specializing in Quranic interpretation.  Your task is to summarize the key themes and messages of a given Surah (chapter) of the Quran.

  Surah Name: {{surahName}}
  Surah Text:
  {{surahText}}

  Provide a concise summary of the Surah's main topics, its central message, and any significant lessons or guidance it offers.`,
});

const summarizeSurahFlow = ai.defineFlow(
  {
    name: 'summarizeSurahFlow',
    inputSchema: SummarizeSurahInputSchema,
    outputSchema: SummarizeSurahOutputSchema,
    cache: {},
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
