import { db } from '@/db';
import { messages, users } from '@/db/schema';
import {
  createMessageSchema,
  deleteMessageSchema,
  getMessagesSchema,
  updateMessageSchema,
} from '@/schemas/messages.schema';
import { createServerFn } from '@tanstack/react-start';
import { asc, eq } from 'drizzle-orm';
import { sendToClients } from './ws';

export const getMessages = createServerFn({
  method: 'GET',
})
  .inputValidator(getMessagesSchema)
  .handler(async ({ data: { page = 1, limit = 30 } }) => {
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

export const sendMessage = createServerFn({
  method: 'POST',
})
  .inputValidator(createMessageSchema)
  .handler(async ({ data: newMessage }) => {
    const [message] = await db.insert(messages).values(newMessage).returning();
    const fullMessage = await getFullMessageById(message.id);

    sendToClients('message:new', fullMessage);
    return fullMessage;
  });

export const updateMessage = createServerFn({
  method: 'POST',
})
  .inputValidator(updateMessageSchema)
  .handler(async ({ data: newMessage }) => {
    const [updatedMsg] = await db
      .update(messages)
      .set({ text: newMessage.text })
      .where(eq(messages.id, newMessage.id))
      .returning();

    const fullMessage = await getFullMessageById(updatedMsg.id);

    sendToClients('message:update', fullMessage);
    return fullMessage;
  });

const getFullMessageById = async (id: string) => {
  const [fullMessage] = await db
    .select({
      author: users,
      id: messages.id,
      text: messages.text,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .innerJoin(users, eq(messages.author, users.id))
    .where(eq(messages.id, id));
  return fullMessage;
};

export const deleteMessage = createServerFn({
  method: 'POST',
})
  .inputValidator(deleteMessageSchema)
  .handler(async ({ data: { id: idToDelete } }) => {
    const deleted = await db.delete(messages).where(eq(messages.id, idToDelete)).returning();
    sendToClients('message:delete', deleted[0]);

    return deleted[0];
  });

export const dummySocketEmit = createServerFn({
  method: 'GET',
}).handler(async () => {
  console.log('DUMMY SERVER');
  sendToClients('test', { message: 'Hello World!' });
  return { success: true };
});
