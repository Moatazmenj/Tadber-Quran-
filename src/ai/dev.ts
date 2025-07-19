import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-surah.ts';
import '@/ai/flows/get-verse-tafsir.ts';
import '@/ai/flows/analyze-recitation.ts';
import '@/ai/flows/get-verse-message.ts';
