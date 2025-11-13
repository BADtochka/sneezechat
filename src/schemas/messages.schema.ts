import z from 'zod';
import { userSchema } from './user.schema.ts';

export const messageSchema = z.object({
  id: z.uuid(),
  author: userSchema,
  text: z.string().min(1).max(280),
  createdAt: z.date(),
  editedAt: z.date().optional().nullable(),
  deletedAt: z.date().optional().nullable(),
  tgMessageId: z.number().optional().nullable(),
});

export const getMessagesSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export const createMessageSchema = z.object({
  author: z.uuid(),
  text: z.string().min(1).max(280),
});

export const updateMessageSchema = z.object({
  id: z.uuid(),
  text: z.string().min(1).max(280),
});

export const deleteMessageSchema = z.object({
  id: z.uuid(),
});
