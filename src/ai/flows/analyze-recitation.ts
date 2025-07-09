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
  feedback: z.string().describe("ملاحظات تفصيلية وبناءة باللغة العربية حول تلاوة المستخدم، تشمل التعليقات على مخارج الحروف، أحكام التجويد، والأخطاء التي تم ارتكابها مع كيفية تصحيحها."),
  score: z.number().min(0).max(100).describe("تقييم رقمي إجمالي من 0 إلى 100 يمثل دقة التلاوة."),
});
export type AnalyzeRecitationOutput = z.infer<typeof AnalyzeRecitationOutputSchema>;

export async function analyzeRecitation(input: AnalyzeRecitationInput): Promise<AnalyzeRecitationOutput> {
  return analyzeRecitationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeRecitationPrompt',
  input: {schema: AnalyzeRecitationInputSchema},
  output: {schema: AnalyzeRecitationOutputSchema},
  prompt: `أنت معلم قرآن خبير متخصص في علم التجويد. مهمتك هي تحليل تلاوة المستخدم لمقطع من القرآن وتقديم ملاحظات مفصلة وبناءة باللغة العربية الفصحى. يجب أن تستند في تحليلك إلى قواعد التجويد المعتمدة من مصادر موثوقة مثل "متن تحفة الأطفال" و"متن الجزرية".

  المستخدم يتلو من سورة: {{surahName}}.

  هذا هو النص العربي الأصلي الذي كان من المفترض أن يتلوه:
  "{{originalText}}"

  استمع بعناية لتلاوة المستخدم الموجودة في الملف الصوتي. قارنها بالنص الأصلي.

  قدم تحليلك باللغة العربية و بالنسق التالي:
  1.  **الملاحظات:** قدم ملاحظات تفصيلية حول مخارج الحروف، تطبيق أحكام التجويد (مثل الإدغام، الإخفاء، القلقلة)، سلاسة التلاوة، والإيقاع. أشر إلى الكلمات المحددة التي حدثت فيها أخطاء واشرح كيفية تصحيحها. كن مشجعًا وداعمًا.
  2.  **التقييم:** أعطِ تقييمًا إجماليًا من 100 لمدى دقة التلاوة.

  صوت تلاوة المستخدم: {{media url=audioDataUri}}`,
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
