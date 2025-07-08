'use server';

import { summarizeSurah } from '@/ai/flows/summarize-surah';
import { getVerseTafsir as getVerseTafsirFlow, type GetVerseTafsirInput } from '@/ai/flows/get-verse-tafsir';

export async function getSurahSummary(surahName: string, surahText: string): Promise<string> {
  // Add a rate limit check here in a real application
  try {
    const result = await summarizeSurah({ surahName, surahText });
    return result.summary;
  } catch (error) {
    console.error('Error in getSurahSummary action:', error);
    // In a real app, you might want to throw a more specific error
    // that the client can interpret.
    throw new Error('Failed to generate summary due to a server error.');
  }
}

export async function getVerseTafsir(input: GetVerseTafsirInput): Promise<string> {
    try {
        const result = await getVerseTafsirFlow(input);
        return result.tafsir;
    } catch (error) {
        console.error('Error in getVerseTafsir action:', error);
        throw new Error('Failed to generate Tafsir due to a server error.');
    }
}
