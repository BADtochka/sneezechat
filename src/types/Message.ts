import { createMessageSchema, messageSchema } from '@/schemas/messages.schema';
import z from 'zod';

export type MessageData = z.infer<typeof messageSchema>;
export type MessageRequest = z.infer<typeof createMessageSchema>;
