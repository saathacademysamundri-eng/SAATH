'use server';
/**
 * @fileOverview A flow for sending WhatsApp messages.
 *
 * - sendWhatsappMessage - A function that sends a WhatsApp message using the configured API.
 */

import { ai } from '@/ai/genkit';
import { sendWhatsappMessage as sendWhatsappMessageSvc } from '@/lib/whatsapp';
import { z } from 'genkit';

export const SendWhatsappMessageInputSchema = z.object({
  to: z.string().describe('The recipient phone number.'),
  body: z.string().describe('The message content.'),
  apiUrl: z.string().describe('The WhatsApp API URL.'),
  token: z.string().describe('The WhatsApp API token.'),
});
export type SendWhatsappMessageInput = z.infer<typeof SendWhatsappMessageInputSchema>;

export const SendWhatsappMessageOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SendWhatsappMessageOutput = z.infer<typeof SendWhatsappMessageOutputSchema>;

export async function sendWhatsappMessage(
  input: SendWhatsappMessageInput
): Promise<SendWhatsappMessageOutput> {
  return sendWhatsappMessageFlow(input);
}

const sendWhatsappMessageFlow = ai.defineFlow(
  {
    name: 'sendWhatsappMessageFlow',
    inputSchema: SendWhatsappMessageInputSchema,
    outputSchema: SendWhatsappMessageOutputSchema,
  },
  async (input) => {
    return await sendWhatsappMessageSvc(input);
  }
);
