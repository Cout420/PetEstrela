'use server';
/**
 * @fileOverview A Genkit flow for shortening a memorial link.
 *
 * - shortenLink - A function that creates a permanent, public URL for a memorial.
 * - ShortenLinkInput - The input type for the shortenLink function.
 * - ShortenLinkOutput - The return type for the shortenLink function.
 */

import { ai } from '@/ai/genkit';
import { createShortLink } from '@/lib/link-service';
import { z } from 'zod';

export const ShortenLinkInputSchema = z.object({
  memorialId: z.number().describe('The unique ID of the pet memorial.'),
});
export type ShortenLinkInput = z.infer<typeof ShortenLinkInputSchema>;

export const ShortenLinkOutputSchema = z.object({
  shortUrl: z.string().url().describe('The shortened, public URL for the memorial.'),
});
export type ShortenLinkOutput = z.infer<typeof ShortenLinkOutputSchema>;

// Exported wrapper function to be used in client components.
export async function shortenLink(input: ShortenLinkInput): Promise<ShortenLinkOutput> {
  return shortenLinkFlow(input);
}

const shortenLinkFlow = ai.defineFlow(
  {
    name: 'shortenLinkFlow',
    inputSchema: ShortenLinkInputSchema,
    outputSchema: ShortenLinkOutputSchema,
  },
  async (input) => {
    const shortUrl = await createShortLink(input.memorialId);
    return { shortUrl };
  }
);
