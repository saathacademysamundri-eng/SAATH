

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

    const result = await response.json();

    if (response.ok && result.sent === 'true') {
        await logMessage('success', to, body);
        return { success: true, message: result.message || 'Message sent successfully.' };
    } else {
        const errorMsg = result.error?.message || result.message || 'Failed to send message.';
        await logMessage('failed', to, body, errorMsg);
        return { success: false, message: `UltraMSG Error: ${errorMsg}` };
    }
  } catch (error) {
    const errorMsg = (error as Error).message || 'An unknown error occurred.';
    console.error('WhatsApp sending failed:', error);
    await logMessage('failed', to, body, errorMsg);
    return { success: false, message: errorMsg };
  }
}
