'use server';

/**
 * @fileOverview Generates a message of the day (MotD) for the GM Groups website.
 *
 * - generateMotd - A function that generates a dynamic MotD based on GM Groups' theme.
 * - GenerateMotdInput - The input type for the generateMotd function (empty).
 * - GenerateMotdOutput - The return type for the generateMotd function (string).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMotdInputSchema = z.object({});
export type GenerateMotdInput = z.infer<typeof GenerateMotdInputSchema>;

const GenerateMotdOutputSchema = z.string();
export type GenerateMotdOutput = z.infer<typeof GenerateMotdOutputSchema>;

export async function generateMotd(input: GenerateMotdInput): Promise<GenerateMotdOutput> {
  return generateMotdFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMotdPrompt',
  input: {schema: GenerateMotdInputSchema},
  output: {schema: GenerateMotdOutputSchema},
  prompt: `You are the voice of GM Groups Pvt Ltd, a dominant Roleplay club in the Xlantis server, known for business, crime, and loyalty.  Generate a short, catchy message of the day (MotD) that reflects the urban nightlife, luxury, and power associated with a GTA V high-end business. Keep it concise and impactful. Do not exceed 20 words.`,
});

const generateMotdFlow = ai.defineFlow(
  {
    name: 'generateMotdFlow',
    inputSchema: GenerateMotdInputSchema,
    outputSchema: GenerateMotdOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
