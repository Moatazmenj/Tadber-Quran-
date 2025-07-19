
'use server';
/**
 * @fileOverview Generates an inspirational message from a Quranic verse.
 *
 * - getVerseMessage - A function that returns a message inspired by a verse.
 * - GetVerseMessageInput - The input type for the getVerseMessage function.
 * - GetVerseMessageOutput - The return type for the getVerseMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetVerseMessageInputSchema = z.object({
  surahName: z.string().describe('The name of the Surah.'),
  verseNumber: z.string().describe('The verse number.'),
  verseText: z.string().describe('The Arabic text of the verse.'),
});
export type GetVerseMessageInput = z.infer<typeof GetVerseMessageInputSchema>;

const GetVerseMessageOutputSchema = z.object({
  message: z.string().describe('A short, inspirational, and reflective message in Arabic, written as if it is a page from a book titled "رسائل من القرآن" (Messages from the Quran). The message should be directed to the reader.'),
});
export type GetVerseMessageOutput = z.infer<typeof GetVerseMessageOutputSchema>;

export async function getVerseMessage(input: GetVerseMessageInput): Promise<GetVerseMessageOutput> {
  return getVerseMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getVerseMessagePrompt',
  input: {schema: GetVerseMessageInputSchema},
  output: {schema: GetVerseMessageOutputSchema},
  prompt: `أنت مؤلف كتاب "رسائل من القرآن". مهمتك هي كتابة رسالة مباشرة من هذا الكتاب، مستوحاة من الآية القرآنية التالية. يجب أن تكون الرسالة باللغة العربية، وعاطفية، وتدعو إلى التأمل.

  الآية من سورة {{surahName}}، آية رقم {{verseNumber}}:
  "{{verseText}}"

  اكتب الرسالة كما لو أنها صفحة مقتبسة من كتابك. يجب أن تبدأ بعبارة افتتاحية مؤثرة مثل "إلى القلب الذي..." أو "يا صاحب الروح...". ركز على الحكمة العميقة في الآية وكيف يمكن أن تلمس حياة القارئ اليومية، وتكون مصدر إلهام وعزاء له. لا تشرح الآية تفسيريًا، بل استخرج منها جوهر الرسالة الروحانية.`,
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

const getVerseMessageFlow = ai.defineFlow(
  {
    name: 'getVerseMessageFlow',
    inputSchema: GetVerseMessageInputSchema,
    outputSchema: GetVerseMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI model did not return a valid message. This may be due to content safety filters.");
    }
    return output;
  }
);
