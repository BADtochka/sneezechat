import { MessageData } from '@/types/Message';
import { createServerOnlyFn } from '@tanstack/react-start';
import { Bot } from 'grammy';
import { createMessage, updateMessage } from './messages';
import { createUser } from './users';
import { wsServer } from './ws';

const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

// Используем глобальную переменную для сохранения бота между HMR
declare global {
  var __telegramBot: Bot | undefined;
}

const getBot = () => {
  if (!global.__telegramBot) {
    global.__telegramBot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);
  }
  return global.__telegramBot;
};

export const telegramBot = createServerOnlyFn(async () => {
  const bot = getBot();

  if (bot.isInited()) return;

  bot.on('message', async (ctx) => {
    const user = await createUser({ name: ctx.from.first_name, nameColor: 'white' });
    console.log(ctx.message.message_id);

    const message = await createMessage({
      author: user.id,
      text: ctx.message.text!,
      tgMessageId: ctx.message.message_id,
    });
    wsServer.broadcast('message:new', message!);
  });

  bot.on('edited_message', async (ctx) => {
    if (!ctx.editedMessage) return;
    const chatMessage = console.log(ctx.editedMessage.text);
    // updateMessage({ id });
  });

  bot.start();
});

export const generateTelegramMessage = (message: MessageData) => {
  return `${message.author.name}: \n${message.text}`;
};

export const sendToTelegram = async (message: string) => {
  const bot = getBot();
  return await bot.api.sendMessage(CHAT_ID, message);
};

export const editTelegramMessage = async (messageId: number, newText: string) => {
  const bot = getBot();

  return await bot.api.editMessageText(CHAT_ID, messageId, newText);
};

export const deleteTelegramMessage = async (messageId: number) => {
  const bot = getBot();
  return await bot.api.deleteMessage(CHAT_ID, messageId);
};

if (process.env.NODE_ENV === 'production') {
  telegramBot();
}
