import { telegram } from './telegram';

const CHAT_ID = process.env.TELEGRAM_CHAT_ID!; // numeric

export const telegramService = () => {
  const telegramClient = telegram.getClient();

  const sendToTelegram = async (message: string) => {
    return await telegramClient.api.sendMessage(CHAT_ID, message);
  };

  const editMessage = async (messageId: number, newText: string) => {
    return await telegramClient.api.editMessageText(CHAT_ID, messageId, newText);
  };

  const deleteMessage = async (messageId: number) => {
    return await telegramClient.api.deleteMessage(CHAT_ID, messageId);
  };

  return { sendToTelegram, editMessage, deleteMessage };
};
