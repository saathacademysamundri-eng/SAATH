import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-announcements.ts';
import '@/ai/flows/send-whatsapp-flow.ts';
