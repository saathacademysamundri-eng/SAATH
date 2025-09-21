'use server';

/**
 * @fileOverview AI agent to summarize academy announcements.
 *
 * - summarizeAnnouncement - A function that summarizes the announcement.
 * - SummarizeAnnouncementInput - The input type for the summarizeAnnouncement function.
 * - SummarizeAnnouncementOutput - The return type for the summarizeAnnouncement function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAnnouncementInputSchema = z.object({
  announcementText: z
    .string()
    .describe('The complete text of the academy announcement.'),
});
export type SummarizeAnnouncementInput = z.infer<
  typeof SummarizeAnnouncementInputSchema
>;

const SummarizeAnnouncementOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise summary of the academy announcement, highlighting the key points.'
    ),
});
export type SummarizeAnnouncementOutput = z.infer<
  typeof SummarizeAnnouncementOutputSchema
>;

export async function summarizeAnnouncement(
  input: SummarizeAnnouncementInput
): Promise<SummarizeAnnouncementOutput> {
  return summarizeAnnouncementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAnnouncementPrompt',
  input: {schema: SummarizeAnnouncementInputSchema},
  output: {schema: SummarizeAnnouncementOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing academy announcements for students and teachers.

  Please provide a short, user-friendly summary of the following announcement, extracting the key information and making it easy to understand quickly:

  Announcement Text: {{{announcementText}}} `,
});

const summarizeAnnouncementFlow = ai.defineFlow(
  {
    name: 'summarizeAnnouncementFlow',
    inputSchema: SummarizeAnnouncementInputSchema,
    outputSchema: SummarizeAnnouncementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
