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
import { wsServer } from './ws';
import { telegramService } from './telegram/telegram.service';
import { MessageData, MessageSendRequest } from '@/types/Message';
import { CreateUser, User } from '@/types/User';

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

    wsServer.broadcast('message:new', fullMessage);

    sendTelegramMessage(fullMessage);

    return fullMessage;
  });

export const createUserInDB = async (newUser: CreateUser): Promise<User> => {
  // const existedUser = await db.query.users.findFirst({
  //   where: eq(users.name, newUser.name),
  // });

  let userToReturn;

  const createdUser = await db.insert(users).values(newUser).returning();
  userToReturn = createdUser[0];
  return userToReturn;
};

// const createNewMessageInDB = async (newMessage: MessageSendRequest) => {
//   const [message] = await db.insert(messages).values(newMessage).returning();
//   const fullMessage = await getFullMessageById(message.id);
//   wsServer.broadcast('message:new', fullMessage);

//   return fullMessage;
// };

const sendTelegramMessage = async (fullMessage: MessageData) => {
  //telegram integration
  const res = await telegramService().sendToTelegram(fullMessage.author.name + ': ' + fullMessage.text);

  if (res) {
    console.log(res.message_id);
    await db.update(messages).set({ tgMessageId: res.message_id }).where(eq(messages.id, fullMessage.id));
  }
};

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

    editTelegramMessage(fullMessage);

    wsServer.broadcast('message:update', fullMessage);
    return fullMessage;
  });

const editTelegramMessage = async (fullMessage: MessageData) => {
  //telegram integration
  await telegramService().editMessage(fullMessage.tgMessageId!, fullMessage.author.name + ': ' + fullMessage.text);
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

export const deleteMessage = createServerFn({
  method: 'POST',
})
  .inputValidator(deleteMessageSchema)
  .handler(async ({ data: { id: idToDelete } }) => {
    const deleted = await db.delete(messages).where(eq(messages.id, idToDelete)).returning();
    wsServer.broadcast('message:delete', deleted[0].id);

    return deleted[0];
  });

// export const dummySocketEmit = createServerFn({
//   method: 'GET',
// }).handler(async () => {
//   console.log('DUMMY SERVER');
//   sendToClients('test', { message: 'Hello World!' });
//   return { success: true };
// });
