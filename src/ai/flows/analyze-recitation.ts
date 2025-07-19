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
      "The user's recitation audio, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  originalText: z.string().describe('The original Arabic text of the verses being recited.'),
  surahName: z.string().describe('The name of the Surah being recited.'),
  language: z.string().optional().default('Arabic').describe('The target language for the analysis feedback (e.g., "English", "Arabic", "French").'),
});
export type AnalyzeRecitationInput = z.infer<typeof AnalyzeRecitationInputSchema>;

const AnalyzeRecitationOutputSchema = z.object({
  feedback: z.string().describe("Detailed and constructive feedback about the user's recitation, covering pronunciation (Makharij), Tajweed rules, and mistakes with corrections. This feedback must be in the specified language."),
  score: z.number().min(0).max(100).optional().describe("An overall score from 0 to 100 representing the accuracy of the recitation."),
});
export type AnalyzeRecitationOutput = z.infer<typeof AnalyzeRecitationOutputSchema>;

export async function analyzeRecitation(input: AnalyzeRecitationInput): Promise<AnalyzeRecitationOutput> {
  return analyzeRecitationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeRecitationPrompt',
  input: {schema: AnalyzeRecitationInputSchema},
  output: {schema: AnalyzeRecitationOutputSchema},
  prompt: `You are an expert Quran teacher specializing in Tajweed. Your task is to analyze a user's recitation of a Quranic passage and provide detailed, constructive feedback in the specified language: {{language}}. Your analysis must be based on established Tajweed rules.

  The user is reciting from Surah: {{surahName}}.

  This is the original Arabic text they were supposed to recite:
  "{{originalText}}"

  Listen carefully to the user's recitation provided in the audio file. Compare it to the original text.

  Provide your analysis in **{{language}}**. Focus on evaluating the following aspects:
  1.  **Pronunciation (Makharij al-Huruf):** Is the user articulating the letters from their correct points of articulation?
  2.  **Vowels and Elongation (Harakat & Mudud):** Is the user correctly applying vowels (Fatha, Damma, Kasra) and elongations (Madd)?
  3.  **Stopping and Starting (Waqf & Ibtida):** Are they pausing and resuming at appropriate places that preserve the meaning?
  4.  **Other Tajweed Rules:** Evaluate the application of other rules like Ghunnah, Idgham, Ikhfa, Qalqalah, etc.

  Based on your analysis of these points, provide your feedback in the "feedback" field and give an overall score out of 100.

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
    outputSchema: AnalyzeRecitationOutputSchema.extend({
      score: z.number().min(0).max(100)
    }),
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a valid analysis. This may be due to content safety filters or an issue with the audio.");
    }
    
    // Heuristically determine score if not provided.
    if (output.score === undefined) {
      const feedback = output.feedback.toLowerCase();
      if (feedback.includes('excellent') || feedback.includes('great') || feedback.includes('very good')) {
        output.score = Math.floor(Math.random() * 11) + 90; // 90-100
      } else if (feedback.includes('good') || feedback.includes('well done')) {
        output.score = Math.floor(Math.random() * 10) + 80; // 80-89
      } else if (feedback.includes('needs improvement') || feedback.includes('mistakes')) {
        output.score = Math.floor(Math.random() * 20) + 60; // 60-79
      } else {
        output.score = Math.floor(Math.random() * 10) + 70; // Default to 70-79 range
      }
    }

    return output as Required<AnalyzeRecitationOutput>;
  }
);
