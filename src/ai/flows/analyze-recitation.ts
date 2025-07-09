'use server';
/**
 * @fileOverview Analyzes a user's Quranic recitation.
 *
 * - analyzeRecitation - A function that analyzes recitation audio against the original text.
 * - AnalyzeRecitationInput - The input type for the analyzeRecitation function.
 * - AnalyzeRecitationOutput - The return type for the analyzeRecitation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeRecitationInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The user's recitation audio, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  originalText: z.string().describe('The original Arabic text of the verses being recited.'),
  surahName: z.string().describe('The name of the Surah being recited.'),
});
export type AnalyzeRecitationInput = z.infer<typeof AnalyzeRecitationInputSchema>;

const AnalyzeRecitationOutputSchema = z.object({
  feedback: z.string().describe("Detailed feedback on the user's recitation, including comments on pronunciation (Makharij), rules of Tajweed, and any mistakes made. The feedback should be constructive and encouraging."),
  score: z.number().min(0).max(100).describe("An overall score from 0 to 100 representing the accuracy of the recitation."),
});
export type AnalyzeRecitationOutput = z.infer<typeof AnalyzeRecitationOutputSchema>;

export async function analyzeRecitation(input: AnalyzeRecitationInput): Promise<AnalyzeRecitationOutput> {
  return analyzeRecitationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeRecitationPrompt',
  input: {schema: AnalyzeRecitationInputSchema},
  output: {schema: AnalyzeRecitationOutputSchema},
  prompt: `You are an expert Quran teacher specializing in Tajweed. Your task is to analyze a user's recitation of a Quranic passage and provide detailed, constructive feedback.

  The user is reciting from Surah: {{surahName}}.

  Here is the original Arabic text they were supposed to recite:
  "{{originalText}}"

  Listen carefully to the user's recitation provided in the audio input. Compare it against the original text.

  Provide your analysis in the following format:
  1.  **Feedback:** Give detailed feedback on their pronunciation (Makharij), application of Tajweed rules (e.g., Idgham, Ikhfa, Qalqalah), fluency, and rhythm. Point out specific words where mistakes were made and explain how to correct them. Be encouraging and supportive.
  2.  **Score:** Assign an overall score out of 100 for accuracy.

  User's recitation audio: {{media url=audioDataUri}}`,
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

const analyzeRecitationFlow = ai.defineFlow(
  {
    name: 'analyzeRecitationFlow',
    inputSchema: AnalyzeRecitationInputSchema,
    outputSchema: AnalyzeRecitationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a valid analysis. This may be due to content safety filters or an issue with the audio.");
    }
    return output;
  }
);
