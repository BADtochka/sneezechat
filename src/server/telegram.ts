import { MessageData } from '@/types/Message';
import { createServerOnlyFn } from '@tanstack/react-start';
import { Bot, Context } from 'grammy';
import { createTelegramMessage, updateTelegramMessage } from './messages';
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

  bot.on('message', async (ctx) => botOnMessage(ctx));
  bot.on('edited_message', async (ctx) => botOnEditMessage(ctx));
  bot.start();
});

const botOnMessage = async (ctx: Context) => {
  if (!ctx.message) return;
  const user = await createUser({ name: ctx.from!.first_name, nameColor: 'white' });
  const message = await createTelegramMessage({
    author: user.id,
    text: ctx.message.text!,
    tgMessageId: ctx.message.message_id,
  });
  wsServer.broadcast('message:new', message);
};

const botOnEditMessage = async (ctx: Context) => {
  if (!ctx.editedMessage) return;
  const message = await updateTelegramMessage({
    tgMessageId: ctx.editedMessage.message_id,
    text: ctx.editedMessage.text!,
  });
  if (message) wsServer.broadcast('message:update', message);
};

export const generateTelegramMessage = (message: MessageData) => {
  return `${message.author.name}: \n${message.text}`;
};

export const sendToTelegram = async (message: string) => {
  const bot = getBot();
  return await bot.api.sendMessage(CHAT_ID, message);
};

export const editTelegramMessage = async (messageId: number, newText: string) => {
  if (!messageId) return;
  const bot = getBot();
  return await bot.api.editMessageText(CHAT_ID, messageId, newText);
};

export const deleteTelegramMessage = async (messageId: number) => {
  if (!messageId) return;
  const bot = getBot();
  return await bot.api.deleteMessage(CHAT_ID, messageId);
};

if (process.env.NODE_ENV === 'production') {
  telegramBot();
}
