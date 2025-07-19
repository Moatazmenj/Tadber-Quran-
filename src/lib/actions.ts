'use server';

import { summarizeSurah, SummarizeSurahInput, SummarizeSurahOutput } from '@/ai/flows/summarize-surah';
import { getVerseTafsir as getVerseTafsirFlow, type GetVerseTafsirInput } from '@/ai/flows/get-verse-tafsir';
import { analyzeRecitation as analyzeRecitationFlow, type AnalyzeRecitationInput, type AnalyzeRecitationOutput } from '@/ai/flows/analyze-recitation';
import { getSpiritualRemedy as getSpiritualRemedyFlow, type SpiritualRemedyInput, type SpiritualRemedyOutput } from '@/ai/flows/get-spiritual-remedy';


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

export async function getVerseTafsir(input: GetVerseTafsirInput) {
    try {
        const result = await getVerseTafsirFlow(input);
        return result;
    } catch (error) {
        console.error('Error in getVerseTafsir action:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to generate Tafsir due to a server error.');
    }
}

export async function getRecitationAnalysis(input: AnalyzeRecitationInput): Promise<AnalyzeRecitationOutput> {
    try {
        const result = await analyzeRecitationFlow(input);
        return result;
    } catch (error) {
        console.error('Error in getRecitationAnalysis action:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to generate recitation analysis due to a server error.');
    }
}

export async function getSpiritualRemedy(input: SpiritualRemedyInput): Promise<SpiritualRemedyOutput> {
    try {
        const result = await getSpiritualRemedyFlow(input);
        return result;
    } catch (error) {
        console.error('Error in getSpiritualRemedy action:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to generate spiritual remedy due to a server error.');
    }
}
