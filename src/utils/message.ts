import { MessageData } from '@/types/Message';
import { UUID } from '@/types/UUID';

export const socketAddNewMessage = (
  newMessage: MessageData,
  messages: MessageData[],
  setMessages: (messages: MessageData[]) => void,
) => {
  if (!newMessage.id) return;
  if (messages.find((msg) => msg.id === newMessage.id)) return;
  setMessages([newMessage, ...messages]);
};
export const socketUpdateMessage = (
  updatedMessage: MessageData,
  messages: MessageData[],
  setMessages: (messages: MessageData[]) => void,
) => {
  if (!updatedMessage.id) return;
  const tempMessages = [...messages];
  const tempMessage = tempMessages.find((msg) => msg.id === updatedMessage.id);
  if (!tempMessage) return;
  tempMessage.text = updatedMessage.text;

  setMessages(tempMessages);
};

export const socketDeleteMessage = (
  id: UUID,
  messages: MessageData[],
  setMessages: (messages: MessageData[]) => void,
) => {
  setMessages(messages.filter((msg) => msg.id !== id));
};
