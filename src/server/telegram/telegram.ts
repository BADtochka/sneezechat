import { Bot } from 'grammy';
import { createUserInDB } from '../user/user.service';
import { createMessageInDb } from '../message/message.service';
import { User } from '@/types/User';
import { wsServer } from '../ws';
// import { createUserInDB } from '../user';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

export class Telegram {
  private telegramClient = new Bot(BOT_TOKEN);

  constructor() {
    this.init();
  }

  private async init() {
    this.telegramClient.start();
    const user = await createUserInDB({ name: 'Telegram Bot', nameColor: '#0088cc' });

    this.initChatListener(user);
    console.log('✅ Telegram client initialized');
  }

  private initChatListener(user: User) {
    console.log('✅ listener?');
    this.telegramClient.on('message', async (msg) => {
      const tgMessage = msg.message; // the message object
      console.log(tgMessage);

      const message = await createMessageInDb({ author: user.id, text: tgMessage.text! });
      wsServer.broadcast('message:new', message!);
    });
  }

  public getClient() {
    if (!this.telegramClient) throw new Error('Telegram client not initialized');
    return this.telegramClient;
  }
}

// Глобальный синглтон телеги
declare global {
  var __TELEGRAM__: Telegram | undefined;
}

export const telegram = globalThis.__TELEGRAM__ ?? new Telegram();
if (!globalThis.__TELEGRAM__) globalThis.__TELEGRAM__ = telegram;
