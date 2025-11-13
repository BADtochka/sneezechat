import { db } from '@/db';
import { messages, users } from '@/db/schema';
import { MessageData, MessageSendRequest, MessageUpdateRequest } from '@/types/Message';
import { asc, eq } from 'drizzle-orm';
import { wsServer } from '../ws';
import { sendTelegramMessage, editTelegramMessage, deleteTelegramMessage } from './telegramMessage.service';
import { createIsomorphicFn } from '@tanstack/react-start';

export const getMessages = async (page: number, limit: number): Promise<MessageData[]> => {
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
};

export const createMessageInDb = createIsomorphicFn().server(
  async (newMessage: MessageSendRequest): Promise<MessageData> => {
    console.log(newMessage);

    const [message] = await db.insert(messages).values(newMessage).returning();
    const fullMessage = await getFullMessageById(message.id);
    return fullMessage!;
  },
);

export const createMessage = async (newMessage: MessageSendRequest): Promise<MessageData> => {
  const fullMessage = await createMessageInDb(newMessage);
  sendTelegramMessage(fullMessage!);
  wsServer.broadcast('message:new', fullMessage!);

  return fullMessage!;
};

export const updateMessageInDb = async (updatedMessage: MessageUpdateRequest): Promise<MessageData> => {
  const [updatedMsg] = await db
    .update(messages)
    .set({ text: updatedMessage.text })
    .where(eq(messages.id, updatedMessage.id))
    .returning();
  const fullMessage = await getFullMessageById(updatedMsg.id);

  return fullMessage;
};

export const updateMessage = async (updatedMessage: MessageUpdateRequest): Promise<MessageData> => {
  const fullMessage = await updateMessageInDb(updatedMessage);

  editTelegramMessage(fullMessage);
  wsServer.broadcast('message:update', fullMessage);

  return fullMessage;
};

export const deleteMessageInDb = async (idToDelete: string): Promise<MessageData> => {
  const fullMessage = await getFullMessageById(idToDelete);
  await db.delete(messages).where(eq(messages.id, idToDelete)).returning();

  return fullMessage;
};

export const deleteMessage = async (idToDelete: string): Promise<MessageData> => {
  const deleteMessage = await deleteMessageInDb(idToDelete);

  deleteTelegramMessage(deleteMessage.tgMessageId!);
  wsServer.broadcast('message:delete', deleteMessage.id);

  return deleteMessage;
};

const getFullMessageById = async (id: string) => {
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
};
