import { Bot } from 'grammy';
import { createUserInDB } from '../user';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

export class Telegram {
  private telegramClient = new Bot(BOT_TOKEN);

  constructor() {
    this.init();
  }

  private async init() {
    this.telegramClient.start();
    await createUserInDB({ name: 'Telegram Bot', nameColor: '#0088cc' });
    console.log('✅ Telegram client initialized');
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
