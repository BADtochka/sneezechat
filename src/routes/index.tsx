import { atomMessageContextCoords, atomMessageContextMenu, atomMessages, atomMessageToEdit } from '@/atoms/messages';
import { typingUsersAtom, userAtom } from '@/atoms/user';
import { ChatInput } from '@/components/ChatInput';
import { ContextMenu } from '@/components/ContextMenu';
import { FileDropArea } from '@/components/FileDropArea';
import { Header } from '@/components/Header';
import { Message } from '@/components/Message';
import { TypingUsers } from '@/components/TypingUsers';
import { useSocket } from '@/hooks/useSocket';
import { deleteMessage, getMessages } from '@/server/messages';
import { MessageData } from '@/types/Message';
import { ServerToClient } from '@/types/Socket';
import { socketAddNewMessage, socketDeleteMessage, socketUpdateMessage } from '@/utils/message';
import { tryCatch } from '@/utils/tryCatch';
import { useClickOutside } from '@mantine/hooks';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useAtom } from 'jotai';
import { Pen, Trash } from 'lucide-react';
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

  const typingUsersMapRef = useRef<Map<string, ServerToClient['user:typing']>>(new Map());

  const [_, setMessageToEdit] = useAtom(atomMessageToEdit);
  const [contextMenuMessage, setContextMenuMessage] = useAtom(atomMessageContextMenu);
  const [coords] = useAtom(atomMessageContextCoords);
  const ref = useClickOutside(() => setContextMenuMessage(null));

  useEffect(() => {
    if (messages.length > 0 || !preloadMessages) return;
    setMessages(preloadMessages);
  }, [preloadMessages, messages]);

  useEffect(() => {
    messages.map((msg) => {
      if (msg.author.id === user!.id) {
        msg.author.nameColor = user!.nameColor;
      }

      return msg;
    });

    const newMessageUnsub = subscribe('message:new', (newMessage) =>
      socketAddNewMessage(newMessage, messages, setMessages),
    );
    const updateMessageUnsub = subscribe('message:update', (updatedMessage) =>
      socketUpdateMessage(updatedMessage, messages, setMessages),
    );
    const deleteMessageUnsub = subscribe('message:delete', (id) => socketDeleteMessage(id, messages, setMessages));

    const userTypingUnsub = subscribe('user:typing', (user) => {
      const typingArray = Array.from(typingUsersMapRef.current.values());
      if (!user.typing && typingArray.length - 1 > 0) {
        typingUsersMapRef.current.delete(user.id);
        return;
      }
      typingUsersMapRef.current.set(user.id, user);

      setTypingUsers(Array.from(typingUsersMapRef.current.values()));
    });

    const updateUserUnsub = subscribe('user:update', (user) => {
      messages.map((msg) => {
        if (msg.author.id === user.id) {
          msg.author.nameColor = user.nameColor;
        }

        return msg;
      });
    });

    return () => {
      newMessageUnsub();
      updateMessageUnsub();
      deleteMessageUnsub();
      userTypingUnsub();
      updateUserUnsub();
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
    <div className='relative mx-auto flex h-dvh max-w-4xl flex-col border-x border-zinc-800'>
      <Header />
      <FileDropArea>
        <div
          className='flex size-full flex-col-reverse gap-4 overflow-auto overflow-x-hidden p-4'
          ref={messagesRef}
          onWheel={() => setContextMenuMessage(null)}
        >
          <AnimatePresence mode='popLayout'>
            {messages.map((message) => (
              <Message key={message.id} data={message} />
            ))}
          </AnimatePresence>
          <ContextMenu
            ref={ref}
            contextMenuIsOpen={!!contextMenuMessage}
            onClose={() => setContextMenuMessage(null)}
            coords={coords}
            items={[
              {
                label: 'Редактировать',
                icon: <Pen />,
                callback: () => setMessageToEdit(contextMenuMessage!),
              },
              {
                label: 'Удалить',
                icon: <Trash />,
                callback: () => handleDeleteMessage(contextMenuMessage!.id),
              },
            ]}
          />
        </div>
        <TypingUsers users={typingUsers} />
        <div className='p-4 pt-0'>
          <ChatInput
            onMessageSend={handleMessageSend}
            onMessageUpdate={(updatedMessage) => socketUpdateMessage(updatedMessage, messages, setMessages)}
          />
        </div>
      </FileDropArea>
    </div>
  );
}
