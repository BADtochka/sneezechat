import { atomMessages } from '@/atoms/messages';
import { ChatInput } from '@/components/ChatInput';
import { Message } from '@/components/Message';
import { useWebSocket } from '@/hooks/useWebSocket';
import { deleteMessage, getMessages } from '@/server/messages';
import { MessageData } from '@/types/Message';
import { tryCatch } from '@/utils/tryCatch';
import { createFileRoute } from '@tanstack/react-router';
import { useAtom } from 'jotai';
import { AnimatePresence, Variants } from 'motion/react';
import * as motion from 'motion/react-client';

import { useEffect, useRef } from 'react';

export const Route = createFileRoute('/')({
  component: RouteComponent,
  loader: async () => await getMessages({ data: { page: 1, limit: 20 } }),
});

function RouteComponent() {
  const preloadMessages = Route.useLoaderData();
  const [messages, setMessages] = useAtom(atomMessages);
  const messagesRef = useRef<HTMLDivElement>(null);
  const { socketMessage } = useWebSocket<MessageData>();

  const listVariants: Variants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
    },
  };

  useEffect(() => {
    setMessages(preloadMessages);
  }, [preloadMessages]);

  useEffect(() => {
    if (!socketMessage) return;
    if (socketMessage.type === 'message:new') {
      const socketMessageData = socketMessage.data;
      if (messages.find((msg) => msg.id === socketMessageData.id)) return;

      setMessages([...messages, socketMessageData]);
    }
    if (socketMessage.type === 'message:delete') {
      const idToDelete = socketMessage.data.id;
      setMessages(messages.filter((msg) => msg.id !== idToDelete));
    }
  }, [socketMessage]);

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scroll({
      top: messagesRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const handleDeleteMessage = async (idToDelete: string) => {
    setMessages(messages.filter((msg) => msg.id !== idToDelete));
    await tryCatch(deleteMessage({ data: { id: idToDelete } }));
  };

  return (
    <div className='flex h-screen flex-col justify-end overflow-hidden'>
      <div className='relative overflow-hidden py-4'>
        <motion.div
          variants={listVariants}
          initial='hidden'
          animate='visible'
          className='relative flex size-full flex-col items-end gap-4 overflow-auto px-4'
          ref={messagesRef}
        >
          <AnimatePresence mode='popLayout'>
            {messages.map((message) => (
              <Message key={message.id} data={message} handleDeleteMessage={handleDeleteMessage} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
      <ChatInput />
    </div>
  );
}
