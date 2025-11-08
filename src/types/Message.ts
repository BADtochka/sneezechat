import { createMessageSchema, messageSchema, updateMessageSchema } from '@/schemas/messages.schema';
import z from 'zod';

export type MessageData = z.infer<typeof messageSchema>;
export type MessageSendRequest = z.infer<typeof createMessageSchema>;
export type MessageUpdateRequest = z.infer<typeof updateMessageSchema>;
