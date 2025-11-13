import {
  createMessageSchema,
  deleteMessageSchema,
  getMessagesSchema,
  updateMessageSchema,
} from '@/schemas/messages.schema';
import { createServerFn } from '@tanstack/react-start';
import { createMessage, deleteMessage, getMessages, updateMessage } from './message.service';

export const getMessagesServerFn = createServerFn({
  method: 'GET',
})
  .inputValidator(getMessagesSchema)
  .handler(async ({ data: { page = 1, limit = 30 } }) => {
    return getMessages(page, limit);
  });

export const sendMessageServerFn = createServerFn({
  method: 'POST',
})
  .inputValidator(createMessageSchema)
  .handler(async ({ data: newMessage }) => {
    return await createMessage(newMessage);
  });

export const updateMessageServerFn = createServerFn({
  method: 'POST',
})
  .inputValidator(updateMessageSchema)
  .handler(async ({ data: updatedMessage }) => {
    return await updateMessage(updatedMessage);
  });

export const deleteMessageServerFn = createServerFn({
  method: 'POST',
})
  .inputValidator(deleteMessageSchema)
  .handler(async ({ data: { id: idToDelete } }) => {
    return await deleteMessage(idToDelete);
  });

// export const dummySocketEmit = createServerFn({
//   method: 'GET',
// }).handler(async () => {
//   console.log('DUMMY SERVER');
//   sendToClients('test', { message: 'Hello World!' });
//   return { success: true };
// });
