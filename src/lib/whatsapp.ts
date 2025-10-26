
type SendWhatsappMessageParams = {
  to: string;
  body: string;
  apiUrl: string;
  token: string;
};

export async function sendWhatsappMessage(params: SendWhatsappMessageParams): Promise<{ success: boolean, message: string }> {
  const { to, body, apiUrl, token } = params;

  if (!apiUrl || !token) {
    return { success: false, message: 'API URL or Token is not configured.' };
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
      return { success: true, message: result.message || 'Message sent successfully.' };
    } else {
        // Try to parse a more specific error from UltraMSG
        if (result.error && result.error.message) {
            return { success: false, message: `UltraMSG Error: ${result.error.message}` };
        }
      return { success: false, message: result.message || 'Failed to send message.' };
    }
  } catch (error) {
    console.error('WhatsApp sending failed:', error);
    return { success: false, message: (error as Error).message || 'An unknown error occurred.' };
  }
}
