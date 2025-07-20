'use server';
/**
 * @fileOverview Analyzes a user's Quranic recitation.
 *
 * - analyzeRecitation - A function that analyzes the recitation audio against the original text.
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
  originalVerseText: z.string().describe('The original Arabic text of the Quranic verse.'),
});
export type AnalyzeRecitationInput = z.infer<typeof AnalyzeRecitationInputSchema>;

const AnalyzeRecitationOutputSchema = z.object({
    feedback: z.string().describe("Overall constructive feedback on the user's recitation, highlighting strengths and areas for improvement in a gentle and encouraging tone."),
    tajweedAnalysis: z.array(z.object({
        word: z.string().describe("The specific word from the verse."),
        assessment: z.string().describe("A brief, specific assessment of the pronunciation and Tajweed rules for this word (e.g., 'Correct Ghunnah', 'Madd length needs adjustment')."),
        isCorrect: z.boolean().describe("Whether the pronunciation of this word was correct."),
    })).describe("A word-by-word analysis of the recitation focusing on Tajweed rules."),
    score: z.number().optional().describe("An overall score from 0 to 100 representing the accuracy of the recitation. 100 is a perfect recitation."),
});
export type AnalyzeRecitationOutput = z.infer<typeof AnalyzeRecitationOutputSchema>;

export async function analyzeRecitation(input: AnalyzeRecitationInput): Promise<AnalyzeRecitationOutput> {
  return analyzeRecitationFlow(input);
}

const prompt = ai.definePrompt({
    name: 'analyzeRecitationPrompt',
    input: { schema: AnalyzeRecitationInputSchema },
    output: { schema: AnalyzeRecitationOutputSchema },
    prompt: `You are a highly skilled Quran teacher specializing in Tajweed. Your task is to analyze a student's recitation of a Quranic verse and provide detailed, constructive feedback.

    The original verse is:
    "{{originalVerseText}}"

    Listen carefully to the student's recitation provided in the audio file.
    {{media url=audioDataUri}}

    Provide your analysis in the following structured format:
    1.  **Overall Feedback**: Give general, encouraging feedback. Mention what the student did well and what they can focus on to improve.
    2.  **Word-by-Word Tajweed Analysis**: Break down the verse word by word. For each word, assess the pronunciation and application of Tajweed rules (e.g., Madd, Ghunnah, Ikhfa, Idgham, Qalqalah). Indicate if the pronunciation was correct or not.
    3.  **Score**: Provide a score out of 100 for the recitation's accuracy.

    Your tone should always be gentle, encouraging, and supportive, aiming to help the student improve their connection with the Quran through beautiful recitation.`,
});

const analyzeRecitationFlow = ai.defineFlow(
    {
        name: 'analyzeRecitationFlow',
        inputSchema: AnalyzeRecitationInputSchema,
        outputSchema: AnalyzeRecitationOutputSchema,
        cache: {},
    },
    async (input) => {
        const { output } = await prompt(input);
        
        if (!output) {
            throw new Error("The AI model did not return a valid analysis.");
        }
        
        // Fallback for score calculation if not provided by the model
        if (output.score === undefined || output.score === null) {
            const correctWords = output.tajweedAnalysis.filter(w => w.isCorrect).length;
            const totalWords = output.tajweedAnalysis.length;
            if (totalWords > 0) {
                output.score = Math.round((correctWords / totalWords) * 100);
            } else {
                output.score = 0;
            }
        }
        
        return output;
    }
);
