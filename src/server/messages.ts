import { MessageData, MessageUpdateRequest, TgMessageSendRequest } from '@/types/Message';
import { createServerFn, createServerOnlyFn } from '@tanstack/react-start';
import { asc, eq } from 'drizzle-orm';
import { db } from '../db';
import { messages, users } from '../db/schema';
import {
  createMessageSchema,
  deleteMessageSchema,
  getMessagesSchema,
  updateMessageSchema,
} from '../schemas/messages.schema';
import { defaultError } from '../utils/throwError';
// import { deleteTelegramMessage, editTelegramMessage, sendTelegramMessage } from './message/telegramMessage.service';
import { UUID } from '@/types/UUID';
import { editTelegramMessage, generateTelegramMessage, sendToTelegram } from './telegram';
import { wsServer } from './ws';

export const getMessagesRequest = createServerFn({
  method: 'GET',
})
  .inputValidator(getMessagesSchema)
  .handler(async ({ data: { page = 1, limit = 30 } }) => {
    return getMessages(page, limit);
  });

export const sendMessageRequest = createServerFn({
  method: 'POST',
})
  .inputValidator(createMessageSchema)
  .handler(async ({ data: message }) => {
    const newMessage = await createMessage(message);
    if (!newMessage) throw defaultError();

    const telegramMessage = await sendToTelegram(generateTelegramMessage(newMessage));
    await updateMessage({ ...newMessage, tgMessageId: telegramMessage.message_id });
    wsServer.broadcast('message:new', newMessage!);
    return newMessage;
  });

export const updateMessageRequest = createServerFn({
  method: 'POST',
})
  .inputValidator(updateMessageSchema)
  .handler(async ({ data: updatedMessage }) => {
    const [updatedMsg] = await db
      .update(messages)
      .set({ text: updatedMessage.text })
      .where(eq(messages.id, updatedMessage.id))
      .returning();
    const fullMessage = await getFullMessageById(updatedMsg.id);
    if (!fullMessage) throw defaultError();

    if (fullMessage.tgMessageId) {
      editTelegramMessage(fullMessage.tgMessageId, fullMessage.text);
    }
    wsServer.broadcast('message:update', fullMessage);
    return fullMessage;
  });

export const deleteMessageRequest = createServerFn({
  method: 'POST',
})
  .inputValidator(deleteMessageSchema)
  .handler(async ({ data: { id: idToDelete } }) => {
    const fullMessage = await getFullMessageById(idToDelete);
    if (!fullMessage) throw defaultError();
    const deletedMessage = await db.delete(messages).where(eq(messages.id, idToDelete)).returning();

    // deleteTelegramMessage(fullMessage.tgMessageId!);
    wsServer.broadcast('message:delete', fullMessage.id);

    return deletedMessage;
  });

export const createMessage = createServerOnlyFn(async (message: TgMessageSendRequest) => {
  const [newMessage] = await db.insert(messages).values(message).returning();
  const fullMessage = await getFullMessageById(newMessage.id);
  return fullMessage;
});

export const updateMessage = createServerOnlyFn(async (message: MessageUpdateRequest) => {
  const { author, id, ...restMessasge } = message;
  return await db.update(messages).set(restMessasge).where(eq(messages.id, message.id));
});

export const getMessage = createServerOnlyFn(async (id: UUID) => {
  // return await db.query
});

export const getMessages = createServerOnlyFn(async (page: number, limit: number): Promise<MessageData[]> => {
  const totalCount = await db.$count(messages);
  const offset = Math.max(0, totalCount - page * limit);

  const data = await db.query.messages.findMany({
    orderBy: (message) => [asc(message.createdAt)],
    offset,
    limit,
    with: {
      author: true,
    },
  });

  const formatted = data.reverse().map((msg) => ({
    ...msg,
    author: msg.author,
  }));
  return formatted;
});

const getFullMessageById = createServerOnlyFn(async (id: string) => {
  const [fullMessage] = await db
    .select({
      author: users,
      id: messages.id,
      text: messages.text,
      createdAt: messages.createdAt,
      tgMessageId: messages.tgMessageId,
    })
    .from(messages)
    .innerJoin(users, eq(messages.author, users.id))
    .where(eq(messages.id, id));
  return fullMessage;
});
