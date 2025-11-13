import z from 'zod';
import {
  createMessageSchema,
  messageSchema,
  tgCreateMessageSchema,
  tgUpdateMessageSchema,
  updateMessageSchema,
} from '../schemas/messages.schema';

export type MessageData = z.infer<typeof messageSchema>;
export type MessageSendRequest = z.infer<typeof createMessageSchema>;
export type MessageUpdateRequest = z.infer<typeof updateMessageSchema>;

export type TgMessageSendRequest = z.infer<typeof tgCreateMessageSchema>;
export type TgMessageUpdateRequest = z.infer<typeof tgUpdateMessageSchema>;
