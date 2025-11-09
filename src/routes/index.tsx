import { atomShowFileOverlay } from '@/atoms/files';
import { atomMessages } from '@/atoms/messages';
import { userAtom } from '@/atoms/user';
import { ChatInput } from '@/components/ChatInput';
import { FileDropOverlay } from '@/components/FileDropOverlay';
import { Header } from '@/components/Header';
import { Message } from '@/components/Message';
import { useWebSocket } from '@/hooks/useWebSocket';
import { deleteMessage, getMessages } from '@/server/messages';
import { MessageData } from '@/types/Message';
import { cn } from '@/utils/cn';
import { tryCatch } from '@/utils/tryCatch';
import { createFileRoute, Navigate, useRouter } from '@tanstack/react-router';
import { useAtom } from 'jotai';
import { AnimatePresence } from 'motion/react';

import { useEffect, useRef, DragEvent } from 'react';

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

  const [showOverlay, setShowOverlay] = useAtom(atomShowFileOverlay);

  useEffect(() => {
    if (messages.length > 0 || !preloadMessages) return;
    setMessages(preloadMessages);
  }, [preloadMessages, messages]);

  useEffect(() => {
    if (!socketMessage) return;
    if (socketMessage.type === 'message:new') {
      addNewMessage(socketMessage.data);
    }

    if (socketMessage.type === 'message:update') {
      updateMessage(socketMessage.data);
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

  const handleMessageSend = (newMessage: MessageData) => {
    if (!messagesRef.current) return;
    addNewMessage(newMessage);
    messagesRef.current.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
  };

  const addNewMessage = (newMessage: MessageData) => {
    if (!newMessage.id) return;
    if (messages.find((msg) => msg.id === newMessage.id)) return;
    setMessages([newMessage, ...messages]);
  };

  const updateMessage = (updatedMessage: MessageData) => {
    if (!updatedMessage.id) return;
    const tempMessages = [...messages];
    const tempMessage = tempMessages.find((msg) => msg.id === updatedMessage.id);
    if (!tempMessage) return;
    tempMessage.text = updatedMessage.text;

    setMessages(tempMessages);
  };

  const handleDropArea = (dataTransfer: DataTransfer | File) => {
    console.log('Dropped data:', dataTransfer);
  };

  const _onDrop = (event: DragEvent<HTMLDivElement>, active: boolean) => {
    if (!Array.from(event.dataTransfer.types).includes('Files')) return;
    event.stopPropagation();
    event.preventDefault();

    const files = event.dataTransfer.files;

    console.log('Dropped data:', files);
  };

  const _onDrag = (event: DragEvent<HTMLDivElement>, active: boolean) => {
    if (!Array.from(event.dataTransfer.types).includes('Files')) return;
    event.stopPropagation();
    event.preventDefault();

    setShowOverlay(active);
  };

  useEffect(() => {
    router.invalidate();
  }, []);

  if (!user) return <Navigate to='/auth' />;

  return (
    <div
      className={cn('relative mx-auto flex h-dvh max-w-4xl flex-col justify-end border-x border-zinc-800', {
        '*:pointer-events-none': showOverlay,
      })}
      onDrop={(event) => _onDrop(event, false)}
      onDragOver={(event) => _onDrag(event, true)}
      onDragLeave={(event) => _onDrag(event, false)}
    >
      {showOverlay && <FileDropOverlay />}
      <Header />
      <div className='flex size-full flex-col-reverse gap-4 overflow-auto overflow-x-hidden p-4' ref={messagesRef}>
        <AnimatePresence mode='popLayout'>
          {messages.map((message) => (
            <Message key={message.id} data={message} handleDeleteMessage={handleDeleteMessage} />
          ))}
        </AnimatePresence>
      </div>
      <ChatInput onMessageSend={handleMessageSend} onMessageUpdate={updateMessage} />
    </div>
  );
}
