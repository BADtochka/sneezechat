import {
  MessageData,
  MessageSendRequest,
  MessageUpdateRequest,
  TgMessageSendRequest,
  TgMessageUpdateRequest,
} from '@/types/Message';
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
import { deleteTelegramMessage, editTelegramMessage, generateTelegramMessage, sendToTelegram } from './telegram';
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

    sendTelegramMessageAndUpdateId(newMessage);

    wsServer.broadcast('message:new', newMessage);
    return newMessage;
  });

const sendTelegramMessageAndUpdateId = createServerOnlyFn(async (newMessage: MessageData) => {
  const telegramMessage = await sendToTelegram(generateTelegramMessage(newMessage));
  const updatedMsg = await updateMessage({ ...newMessage, tgMessageId: telegramMessage.message_id });
  wsServer.broadcast('message:update', updatedMsg);
});

export const updateMessageRequest = createServerFn({
  method: 'POST',
})
  .inputValidator(updateMessageSchema)
  .handler(async ({ data: updatedMessage }) => {
    const updatedMsg = await updateMessage(updatedMessage);
    if (!updatedMsg) throw defaultError();

    if (updatedMsg.tgMessageId) {
      editTelegramMessage(updatedMsg.tgMessageId, generateTelegramMessage(updatedMsg));
    }

    wsServer.broadcast('message:update', updatedMsg);
    return updatedMsg;
  });

export const deleteMessageRequest = createServerFn({
  method: 'POST',
})
  .inputValidator(deleteMessageSchema)
  .handler(async ({ data: { id: idToDelete } }) => {
    const fullMessage = await getFullMessageById(idToDelete);
    if (!fullMessage) throw defaultError();
    const deletedMessage = await db.delete(messages).where(eq(messages.id, idToDelete)).returning();

    deleteTelegramMessage(fullMessage.tgMessageId!);
    wsServer.broadcast('message:delete', fullMessage.id);

    return deletedMessage;
  });

export const createMessage = createServerOnlyFn(async (message: MessageSendRequest): Promise<MessageData> => {
  const [newMessage] = await db.insert(messages).values(message).returning();
  const fullMessage = await getFullMessageById(newMessage.id);
  return fullMessage;
});

export const updateMessage = createServerOnlyFn(async (message: MessageUpdateRequest): Promise<MessageData> => {
  const { author, id, ...restMessage } = message;
  const [newMessage] = await db.update(messages).set(restMessage).where(eq(messages.id, message.id)).returning();
  const fullMessage = await getFullMessageById(newMessage.id);
  return fullMessage;
});

export const createTelegramMessage = createServerOnlyFn(async (message: TgMessageSendRequest): Promise<MessageData> => {
  const [newMessage] = await db.insert(messages).values(message).returning();
  const fullMessage = await getFullMessageById(newMessage.id);
  return fullMessage;
});

export const updateTelegramMessage = createServerOnlyFn(
  async (message: TgMessageUpdateRequest): Promise<MessageData | null> => {
    if (!message.tgMessageId) return null;

    const [updateMessage] = await db
      .update(messages)
      .set(message)
      .where(eq(messages.tgMessageId, message.tgMessageId))
      .returning();

    const fullMessage = await getFullMessageById(updateMessage.id);
    return fullMessage;
  },
);

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

const getFullMessageById = createServerOnlyFn(async (id: string): Promise<MessageData> => {
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

const getFullMessageByTelegramId = createServerOnlyFn(async (tgMessageId: number): Promise<MessageData> => {
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
    .where(eq(messages.tgMessageId, tgMessageId));
  return fullMessage;
});

export const uploadFile = createServerFn()
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error('Expected FormData');
    }

    return {
      file: data.get('file'),
    };
  })
  .handler(async ({ data: file }) => {
    console.log(file);
  });
