
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
  message: z.string().describe('A short, inspirational, and reflective message in Arabic, as if it were a page from a book titled "رسائل من القرآن" (Messages from the Quran). The message should be directed to the reader.'),
});
export type GetVerseMessageOutput = z.infer<typeof GetVerseMessageOutputSchema>;

export async function getVerseMessage(input: GetVerseMessageInput): Promise<GetVerseMessageOutput> {
  return getVerseMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getVerseMessagePrompt',
  input: {schema: GetVerseMessageInputSchema},
  output: {schema: GetVerseMessageOutputSchema},
  prompt: `أنت مؤلف كتاب "رسائل من القرآن". مهمتك هي كتابة رسالة قصيرة وملهمة وموجهة للقارئ، مستوحاة من الآية القرآنية التالية. يجب أن تكون الرسالة باللغة العربية، وعاطفية، وتدعو إلى التأمل والتفكر.

  الآية من سورة {{surahName}}، آية رقم {{verseNumber}}:
  "{{verseText}}"

  اكتب رسالة وجدانية قصيرة تبدأ بـ "إلى كل قلب..." أو "يا صاحب القلب..." أو صيغة مشابهة، وركز على الدروس العملية والإيمانية التي يمكن استخلاصها من الآية وتطبيقها في الحياة اليومية. اجعل الرسالة تلامس القلب وتحفز على التغيير الإيجابي. لا تشرح الآية بشكل مباشر، بل استلهم منها رسالة روحانية.`,
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
