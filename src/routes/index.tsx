import { atomMessages } from '@/atoms/messages';
import { typingUsersAtom, userAtom } from '@/atoms/user';
import { ChatInput } from '@/components/ChatInput';
import { FileDropArea } from '@/components/FileDropArea';
import { Header } from '@/components/Header';
import { Message } from '@/components/Message';
import { TypingUsers } from '@/components/TypingUsers';
import { useSocket } from '@/hooks/useSocket';
import { deleteMessage, getMessages } from '@/server/messages';
import { MessageData } from '@/types/Message';
import { socketAddNewMessage, socketDeleteMessage, socketUpdateMessage } from '@/utils/message';
import { tryCatch } from '@/utils/tryCatch';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useAtom } from 'jotai';
import { AnimatePresence } from 'motion/react';

import { useEffect, useRef } from 'react';

export const Route = createFileRoute('/')({
  ssr: 'data-only',
  component: RouteComponent,
  loader: async () => await getMessages({ data: { page: 1, limit: 20 } }),
});

function RouteComponent() {
  const preloadMessages = Route.useLoaderData();
  const [messages, setMessages] = useAtom(atomMessages);
  const messagesRef = useRef<HTMLDivElement>(null);
  const { subscribe } = useSocket();
  const [user] = useAtom(userAtom);
  const [typingUsers, setTypingUsers] = useAtom(typingUsersAtom);

  useEffect(() => {
    if (messages.length > 0 || !preloadMessages) return;
    setMessages(preloadMessages);
  }, [preloadMessages, messages]);

  useEffect(() => {
    const newMessageUnsub = subscribe('message:new', (newMessage) =>
      socketAddNewMessage(newMessage, messages, setMessages),
    );
    const updateMessageUnsub = subscribe('message:update', (updatedMessage) =>
      socketUpdateMessage(updatedMessage, messages, setMessages),
    );
    const deleteMessageUnsub = subscribe('message:delete', (id) => socketDeleteMessage(id, messages, setMessages));

    const userTypingUnsub = subscribe('user:typing', (user) =>
      setTypingUsers([...typingUsers.filter((oldUser) => oldUser.id !== user.id), user]),
    );

    return () => {
      newMessageUnsub();
      updateMessageUnsub();
      deleteMessageUnsub();
      userTypingUnsub();
    };
  }, [messages, typingUsers]);

  const handleDeleteMessage = async (idToDelete: string) => {
    setMessages(messages.filter((msg) => msg.id !== idToDelete));
    await tryCatch(deleteMessage({ data: { id: idToDelete } }));
  };

  const handleMessageSend = (newMessage: MessageData) => {
    if (!messagesRef.current) return;
    socketAddNewMessage(newMessage, messages, setMessages);
    messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
  };

  if (!user) return <Navigate to='/auth' />;

  return (
    <div className='relative mx-auto flex h-dvh max-w-4xl flex-col justify-end border-x border-zinc-800'>
      <Header />
      <FileDropArea>
        <div className='flex size-full flex-col-reverse gap-4 overflow-auto overflow-x-hidden p-4' ref={messagesRef}>
          <AnimatePresence mode='popLayout'>
            {messages.map((message) => (
              <Message key={message.id} data={message} handleDeleteMessage={handleDeleteMessage} />
            ))}
          </AnimatePresence>
        </div>
      </FileDropArea>
      <TypingUsers users={typingUsers.sort((userA, userB) => userB.name.localeCompare(userA.name))} />
      <ChatInput
        onMessageSend={handleMessageSend}
        onMessageUpdate={(updatedMessage) => socketUpdateMessage(updatedMessage, messages, setMessages)}
      />
    </div>
  );
}
