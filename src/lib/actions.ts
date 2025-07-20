'use server';

import { summarizeSurah as summarizeSurahFlow, type SummarizeSurahInput, type SummarizeSurahOutput } from '@/ai/flows/summarize-surah';
import { getVerseTafsir as getVerseTafsirFlow, type GetVerseTafsirInput } from '@/ai/flows/get-verse-tafsir';
import { getSpiritualRemedy as getSpiritualRemedyFlow, type SpiritualRemedyInput, type SpiritualRemedyOutput } from '@/ai/flows/get-spiritual-remedy';
import { analyzeRecitation as analyzeRecitationFlow, type AnalyzeRecitationInput, type AnalyzeRecitationOutput } from '@/ai/flows/analyze-recitation';


export async function summarizeSurah(input: SummarizeSurahInput): Promise<SummarizeSurahOutput> {
  try {
    const result = await summarizeSurahFlow(input);
    return result;
  } catch (error) {
    console.error('Error in getSurahSummary action:', error);
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
            if (error.message.includes('429')) {
                throw new Error('You have exceeded the daily limit for Tafsir generation. Please try again tomorrow.');
            }
            throw error;
        }
        throw new Error('Failed to generate Tafsir due to a server error.');
    }
}

export async function getSpiritualRemedy(input: SpiritualRemedyInput): Promise<SpiritualRemedyOutput> {
    try {
        const result = await getSpiritualRemedyFlow(input);
        return result;
    } catch (error) {
        console.error('Error in getSpiritualRemedy action:', error);
        if (error instanceof Error) {
             if (error.message.includes('429')) {
                throw new Error('You have exceeded the daily limit for the Spiritual Clinic. Please try again tomorrow.');
            }
            throw error;
        }
        throw new Error('Failed to generate spiritual remedy due to a server error.');
    }
}

export async function analyzeRecitation(input: AnalyzeRecitationInput): Promise<AnalyzeRecitationOutput> {
    try {
        const result = await analyzeRecitationFlow(input);
        return result;
    } catch (error) {
        console.error('Error in analyzeRecitation action:', error);
        if (error instanceof Error) {
            if (error.message.includes('429')) {
                throw new Error('You have exceeded the daily limit for recitation analysis. Please try again tomorrow.');
            }
            throw error;
        }
        throw new Error('Failed to analyze recitation due to a server error.');
    }
}
