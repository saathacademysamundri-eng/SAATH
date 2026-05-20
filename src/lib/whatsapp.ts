
'use server';

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase/config";

type SendWhatsappMessageParams = {
  to: string;
  body: string;
  apiUrl: string;
  token: string;
};

async function logMessage(status: 'success' | 'failed', to: string, body: string, error?: string) {
    try {
        await addDoc(collection(db, 'message_logs'), {
            to,
            body,
            status,
            error: error || null,
            timestamp: serverTimestamp(),
        });
    } catch (e) {
        console.error("Failed to log message to Firestore:", e);
    }
}

/**
 * Sends a WhatsApp message via the configured API.
 * This function runs exclusively on the server to avoid CORS issues and protect tokens.
 */
export async function sendWhatsappMessage(params: SendWhatsappMessageParams): Promise<{ success: boolean, message: string }> {
  const { to, body, apiUrl, token } = params;

  if (!apiUrl || !token) {
    const errorMsg = 'API URL or Token is not configured.';
    await logMessage('failed', to, body, errorMsg);
    return { success: false, message: errorMsg };
  }

  try {
    const response = await fetch(`${apiUrl}/messages/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
        to: to,
        body: body,
        priority: 10,
      }),
    });

    const contentType = response.headers.get("content-type");
    let result;
    
    if (contentType && contentType.indexOf("application/json") !== -1) {
        result = await response.json();
    } else {
        const text = await response.text();
        throw new Error(`Invalid response from API: ${text.substring(0, 100)}`);
    }

    if (response.ok && (result.sent === 'true' || result.sent === true || result.success === true)) {
        await logMessage('success', to, body);
        return { success: true, message: result.message || 'Message sent successfully.' };
    } else {
        const errorMsg = result.error?.message || result.message || result.error || 'Failed to send message.';
        await logMessage('failed', to, body, String(errorMsg));
        return { success: false, message: `WhatsApp API Error: ${errorMsg}` };
    }
  } catch (error) {
    const errorMsg = (error as Error).message || 'An unknown network error occurred.';
    console.error('WhatsApp sending failed:', error);
    await logMessage('failed', to, body, errorMsg);
    return { success: false, message: errorMsg };
  }
}
