'use server';
/**
 * @fileOverview Analyzes a user's Quranic recitation with expert-level feedback.
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
      "The user's recitation audio, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  originalVerseText: z.string().describe('The original Arabic text of the Quranic verse.'),
});
export type AnalyzeRecitationInput = z.infer<typeof AnalyzeRecitationInputSchema>;

const DetailedAssessmentSchema = z.object({
    makharij: z.string().describe("Assessment of the letter's articulation point (Makhraj). Include the letter and the feedback."),
    sifaat: z.string().describe("Assessment of the letter's attributes (Sifaat). Include the letter and the feedback."),
    tajweedRule: z.string().describe("Assessment of any applicable Tajweed rule (e.g., Madd, Ghunnah, Ikhfa, Idgham, Qalqalah). Include the rule and the feedback."),
    timing: z.string().describe("Feedback on the timing and rhythm of the word or phrase, especially for Madd (lengthening) and Ghunnah (nasalization)."),
});

const AnalyzeRecitationOutputSchema = z.object({
    overallFeedback: z.string().describe("A comprehensive and encouraging summary of the recitation, highlighting strengths and key areas for improvement in a gentle and supportive tone. Start with a positive opening (e.g., Masha'Allah, Barak'Allah feek)."),
    wordByWordAnalysis: z.array(z.object({
        word: z.string().describe("The specific word from the verse in Arabic."),
        assessment: z.string().describe("A concise, overall assessment for this word (e.g., 'Excellent', 'Needs practice', 'Good', 'Attention needed')."),
        isCorrect: z.boolean().describe("Whether the overall pronunciation of this word was correct."),
        details: DetailedAssessmentSchema.optional().describe("Detailed breakdown of the assessment only if there are specific points of feedback for this word."),
    })).describe("A detailed, word-by-word analysis of the recitation."),
    actionableTips: z.array(z.string()).describe("A list of 2-3 specific, actionable tips for the user to focus on for improvement based on the analysis. The tips should be practical and easy to understand."),
    score: z.number().min(0).max(100).describe("An overall score from 0 to 100 representing the accuracy and quality of the recitation. 100 is a perfect recitation."),
    areasForImprovement: z.object({
        makharij: z.array(z.string()).describe("List of specific letters whose articulation (Makhraj) needs work."),
        tajweed: z.array(z.string()).describe("List of specific Tajweed rules that need more practice (e.g., 'Madd Al-Muttasil', 'Ikhfa').")
    }).describe("A summary of the primary areas needing improvement.")
});
export type AnalyzeRecitationOutput = z.infer<typeof AnalyzeRecitationOutputSchema>;

export async function analyzeRecitation(input: AnalyzeRecitationInput): Promise<AnalyzeRecitationOutput> {
  return analyzeRecitationFlow(input);
}

const prompt = ai.definePrompt({
    name: 'analyzeRecitationPrompt',
    input: { schema: AnalyzeRecitationInputSchema },
    output: { schema: AnalyzeRecitationOutputSchema },
    prompt: `You are a world-class Quran teacher (Mu'allim) with profound expertise in Tajweed, Makharij al-Huruf, Sifaat al-Huruf, and the science of recitation (Ilm al-Qira'at). Your student is providing a recitation and seeks your precise, encouraging, and deeply knowledgeable feedback. Your tone should be that of a wise, gentle, and motivating guide.

    The original verse is:
    "{{originalVerseText}}"

    Listen meticulously to the student's recitation provided in the audio file.
    {{media url=audioDataUri}}

    Provide your analysis in the following structured format:

    1.  **Overall Feedback**: Begin with a warm, encouraging opening (e.g., "Masha'Allah, a beautiful effort in reciting the words of Allah."). Praise specific strengths you observed (e.g., "Your pacing is steady," or "The clarity of your Seen (س) is commendable"). Then, gently transition to the areas for growth (e.g., "To elevate your recitation further, let's focus together on a couple of areas...").

    2.  **Word-by-Word Analysis**:
        *   Iterate through each word of the verse.
        *   For each word, determine if the overall pronunciation was correct (\`isCorrect\`).
        *   Provide a brief, general assessment (\`assessment\`).
        *   **Crucially, only if a word has an error or a point of improvement**, provide a \`details\` object with specific, constructive feedback on one or more of the following, as applicable:
            *   \`makharij\`: Pinpoint the specific letter and the correction needed. Example: "For the letter 'ق', ensure the articulation point is the deepest part of the tongue rising to the soft palate."
            *   \`sifaat\`: Note the attribute that needs adjustment. Example: "The 'Tafkhim' (heaviness) of the 'ص' should be more pronounced compared to the 'س'."
            *   \`tajweedRule\`: Identify the specific rule and how to apply it correctly. Example: "The Ikhfa' on the Noon Saakin before the letter 'ت' should have a light nasalization (ghunnah)." or "The Madd Al-Muttasil in this word requires a length of 4-5 counts."
            *   \`timing\`: Comment on rhythm or duration. Example: "The ghunnah on the Meem Mushaddadah should be held for approximately two counts."
        *   If a word is recited perfectly, simply mark it as correct and provide a positive assessment like "Excellent" or "Masha'Allah". Do not include the \`details\` object for perfectly recited words.

    3. **Areas For Improvement**:
        *   Based on the detailed analysis, summarize the key patterns of error.
        *   List the specific letters whose \`makharij\` needs focus.
        *   List the specific \`tajweed\` rules that require more practice.

    4.  **Actionable Tips**: Provide 2-3 clear, practical, and inspiring tips for the student. These should directly address the 'Areas For Improvement'. For instance: "Listen to Sheikh Al-Husary's recitation of this Surah, focusing only on how he pronounces the letters ض and ظ." or "Practice the Qalqalah letters by saying them with a sukoon and feeling the 'bounce'."

    5.  **Score**: Conclude with an overall score out of 100, reflecting accuracy, application of Tajweed, and flow.

    Your feedback is an amanah (a trust). Deliver it with wisdom and compassion to help the student draw closer to the Quran.`,
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
            const correctWords = output.wordByWordAnalysis.filter(w => w.isCorrect).length;
            const totalWords = output.wordByWordAnalysis.length;
            if (totalWords > 0) {
                output.score = Math.round((correctWords / totalWords) * 100);
            } else {
                output.score = 0;
            }
        }
        
        return output;
    }
);
