import { atomMessages } from '@/atoms/messages';
import { userAtom } from '@/atoms/user';
import { ChatInput } from '@/components/ChatInput';
import { Header } from '@/components/Header';
import { Message } from '@/components/Message';
import { useWebSocket } from '@/hooks/useWebSocket';
import { deleteMessage, getMessages } from '@/server/messages';
import { MessageData } from '@/types/Message';
import { tryCatch } from '@/utils/tryCatch';
import { createFileRoute, Navigate, useRouter } from '@tanstack/react-router';
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
  const router = useRouter();
  const [messages, setMessages] = useAtom(atomMessages);
  const messagesRef = useRef<HTMLDivElement>(null);
  const { socketMessage } = useWebSocket<MessageData>();
  const [user] = useAtom(userAtom);

  useEffect(() => {
    if (messages.length > 0 || !preloadMessages) return;
    setMessages(preloadMessages);
  }, [preloadMessages, messages]);

  useEffect(() => {
    if (!socketMessage) return;
    if (socketMessage.type === 'message:new') {
      const socketMessageData = socketMessage.data;
      if (messages.find((msg) => msg.id === socketMessageData.id)) return;

      setMessages([socketMessageData, ...messages]);
    }
    if (socketMessage.type === 'message:delete') {
      const idToDelete = socketMessage.data.id;
      setMessages(messages.filter((msg) => msg.id !== idToDelete));
    }
  }, [socketMessage]);

  const handleDeleteMessage = async (idToDelete: string) => {
    setMessages(messages.filter((msg) => msg.id !== idToDelete));
    await tryCatch(deleteMessage({ data: { id: idToDelete } }));
  };

  const handleMessageSend = () => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    router.invalidate();
  }, []);

  if (!user) return <Navigate to='/auth' />;

  return (
    <div className='mx-auto flex h-dvh max-w-4xl flex-col justify-end border-x border-zinc-800'>
      <Header />
      <div className='flex size-full flex-col-reverse gap-4 overflow-auto p-4' ref={messagesRef}>
        <AnimatePresence mode='popLayout'>
          {messages.map((message) => (
            <Message key={message.id} data={message} handleDeleteMessage={handleDeleteMessage} />
          ))}
        </AnimatePresence>
      </div>
      <ChatInput onMessageSend={handleMessageSend} />
    </div>
  );
}
