import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({apiKey: process.env.Gemini_Api})],
  model: 'googleai/gemini-1.5-flash-latest',
});
