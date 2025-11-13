import { db } from '@/db';
import { messages } from '@/db/schema';
import { MessageData } from '@/types/Message';
import { eq } from 'drizzle-orm';
import { telegramService } from '../telegram/telegram.service';

export const sendTelegramMessage = async (fullMessage: MessageData) => {
  //telegram integration
  const res = await telegramService().sendToTelegram(fullMessage.author.name + ': ' + fullMessage.text);

  if (res) {
    await db.update(messages).set({ tgMessageId: res.message_id }).where(eq(messages.id, fullMessage.id));
  }
};

export const editTelegramMessage = async (fullMessage: MessageData) => {
  await telegramService().editMessage(fullMessage.tgMessageId!, fullMessage.author.name + ': ' + fullMessage.text);
};

export const deleteTelegramMessage = async (tgMessageId: number) => {
  await telegramService().deleteMessage(tgMessageId);
};
