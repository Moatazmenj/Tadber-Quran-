'use server';
/**
 * @fileOverview Provides a spiritual remedy from the Quran based on user's feelings.
 *
 * - getSpiritualRemedy - A function that suggests Quranic verses, provides tafsir, a dua, and a recitation suggestion.
 * - SpiritualRemedyInput - The input type for the getSpiritualRemedy function.
 * - SpiritualRemedyOutput - The return type for the getSpiritualRemedy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { reciters } from '@/lib/reciters';
import { surahs } from '@/lib/quran';

const SpiritualRemedyInputSchema = z.object({
  feeling: z.string().describe('The user’s description of their current feeling or situation.'),
});
export type SpiritualRemedyInput = z.infer<typeof SpiritualRemedyInputSchema>;

const SpiritualRemedyOutputSchema = z.object({
  verses: z.array(z.object({
    verse_key: z.string().describe('The reference of the verse (e.g., "3:139").'),
    text: z.string().describe('The Arabic text of the verse.'),
  })).describe('An array of 1-3 Quranic verses suitable for the user’s feeling.'),
  tafsir: z.string().describe('A brief and gentle interpretation of the suggested verses, connecting them to the user’s feeling.'),
  dua: z.string().describe('A relevant and comforting supplication (Dua) from the Quran or Sunnah.'),
  recitationSuggestion: z.object({
    surahId: z.number().describe('The ID of the Surah recommended for listening.'),
    surahName: z.string().describe('The name of a Surah recommended for listening.'),
    reciterId: z.number().describe('The ID of a reciter known for an emotional and touching recitation style.'),
    reciterName: z.string().describe('The name of a reciter known for an emotional and touching recitation style (e.g., Yasser Ad-Dussary).'),
  }).describe('A suggestion for a Surah and a reciter to listen to for comfort.'),
});
export type SpiritualRemedyOutput = z.infer<typeof SpiritualRemedyOutputSchema>;

export async function getSpiritualRemedy(input: SpiritualRemedyInput): Promise<SpiritualRemedyOutput> {
  return getSpiritualRemedyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getSpiritualRemedyPrompt',
  input: {schema: SpiritualRemedyInputSchema},
  output: {schema: z.object({
    verses: z.array(z.object({
      verse_key: z.string().describe('The reference of the verse (e.g., "3:139").'),
      text: z.string().describe('The Arabic text of the verse.'),
    })),
    tafsir: z.string(),
    dua: z.string(),
    recitationSuggestion: z.object({
      surahName: z.string(),
      reciterName: z.string(),
    }),
  })},
  prompt: `أنت مرشد روحي في "عيادة قرآنية". مهمتك هي تقديم وصفة إيمانية من القرآن الكريم بناءً على شعور المستخدم. يجب أن تكون إجابتك باللغة العربية.

  شعور المستخدم: "{{feeling}}"

  بناءً على هذا الشعور، قم بتوفير ما يلي:
  1.  **آيات مناسبة:** اختر من 1 إلى 3 آيات قرآنية تكون بمثابة علاج ودعم للحالة. اذكر الآية مع مرجعها (مثال: "3:139").
  2.  **تفسير مختصر:** قدم تفسيراً موجزاً ولطيفاً للآيات المقترحة، يربطها بحالة المستخدم ويبرز رسالة الأمل والسكينة فيها.
  3.  **دعاء مأثور:** اختر دعاءً مناسباً ومريحاً من القرآن أو السنة النبوية.
  4.  **توصية تلاوة:** اقترح سورة لتلاوة مؤثرة، مع اقتراح اسم قارئ معروف بتلاوته الخاشعة والمؤثرة (مثل ياسر الدوسري أو مشاري العفاسي) لتعميق الأثر الروحي.

  يجب أن تكون جميع الردود باللغة العربية الفصحى وبأسلوب يبعث على الطمأنينة والراحة.`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
});

const getSpiritualRemedyFlow = ai.defineFlow(
  {
    name: 'getSpiritualRemedyFlow',
    inputSchema: SpiritualRemedyInputSchema,
    outputSchema: SpiritualRemedyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a valid response. Please try rephrasing your feeling.");
    }
    
    // Find Surah and Reciter IDs
    const suggestedSurah = surahs.find(s => s.name.toLowerCase() === output.recitationSuggestion.surahName.toLowerCase());
    const suggestedReciter = reciters.find(r => r.name.toLowerCase().includes(output.recitationSuggestion.reciterName.toLowerCase()));

    // Fallback to defaults if not found
    const surahId = suggestedSurah ? suggestedSurah.id : 36; // Ya-Sin
    const reciterId = suggestedReciter ? suggestedReciter.id : 11; // Yasser Ad-Dussary

    return {
        ...output,
        recitationSuggestion: {
            surahId: surahId,
            surahName: suggestedSurah?.name || 'Ya-Sin',
            reciterId: reciterId,
            reciterName: suggestedReciter?.name || 'Yasser Ad-Dussary'
        }
    };
  }
);
