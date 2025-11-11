import { atomMessageToEdit } from '@/atoms/messages';
import { userAtom } from '@/atoms/user';
import { Emoji, useEmoji } from '@/hooks/useEmojis';
import { useSocket } from '@/hooks/useSocket';
import { sendMessage, updateMessage } from '@/server/messages';
import { MessageData, MessageSendRequest, MessageUpdateRequest } from '@/types/Message';
import { tryCatch } from '@/utils/tryCatch';
import { useDebouncedCallback, useFocusTrap, useMergedRef, useThrottledCallback } from '@mantine/hooks';
import { useAtom } from 'jotai';
import { Check, File, SendHorizontal } from 'lucide-react';
import { ChangeEvent, FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { ColonPicker } from './ColonPicker';
import { EmojiPicker } from './EmojiPicker';
import { MessageToEditPreview } from './MessageToEditView';

type ChatInputProps = {
  onMessageSend: (newMessage: MessageData) => void;
  onMessageUpdate: (messageToUpdate: MessageData) => void;
};

export const ChatInput: FC<ChatInputProps> = ({ onMessageSend, onMessageUpdate }) => {
  const [user] = useAtom(userAtom);
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const { findEmojis, findedEmojis, query } = useEmoji();
  const [messageToEdit, setMessageToEdit] = useAtom(atomMessageToEdit);
  const focusTrapRef = useFocusTrap();
  const mergedRef = useMergedRef(inputRef, focusTrapRef);
  const throttledTyping = useThrottledCallback(
    () =>
      send('user:typing', {
        id: user!.id,
        name: user!.name,
        typing: true,
      }),
    1000,
  );
  const debouncedTyping = useDebouncedCallback(
    () =>
      send('user:typing', {
        id: user!.id,
        name: user!.name,
        typing: false,
      }),
    800,
  );
  const { send } = useSocket();

  const handleMessage = async () => {
    if (!inputRef.current) return;

    if (messageToEdit) {
      await handleUpdateMessage();
    } else {
      await handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!user || !text) return;

    const newMessageData: MessageSendRequest = {
      author: user.id,
      text: text,
    };

    const { data: newMessage, error } = await tryCatch(sendMessage({ data: newMessageData }));

    if (error) {
      console.error(error);
      return;
    }

    if (newMessage) {
      setText('');
      onMessageSend(newMessage);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!inputRef.current) return;

    if (e.key === 'Escape') {
      setText('');
      setMessageToEdit(null);
      return;
    }

    if (e.key === 'Enter') {
      handleMessage();
      return;
    }
  };

  const handleUpdateMessage = async () => {
    if (!user || !text || !messageToEdit) return;

    const messageForUpdate: MessageUpdateRequest = {
      id: messageToEdit.id,
      text: text,
    };

    const { data: updatedMessage, error } = await tryCatch(updateMessage({ data: messageForUpdate }));

    if (error) {
      console.error(error);
      return;
    }

    if (updatedMessage) {
      setText('');
      setMessageToEdit(null);

      onMessageUpdate(updatedMessage);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const content = e.target.value;
    setText(content);
    if (content.length < 1) {
      debouncedTyping();
      return;
    }

    throttledTyping();
    debouncedTyping();
    if (content.includes(':') && content.length > 2) {
      findEmojis(content);
      setOpen(true);
    } else if (open) {
      setOpen(false);
    }
  };

  const handleEmoji = (data: Emoji) => {
    if (query) {
      setText((prev) => prev.replace(query, data.native));
      setOpen(false);
      return;
    }

    setText((prev) => `${prev}${data.native}`);
  };

  useEffect(() => {
    setText(messageToEdit?.text ?? '');
    inputRef.current?.focus();
  }, [messageToEdit]);

  return (
    <div className='relative flex w-full flex-col justify-end bg-zinc-800 px-4'>
      <MessageToEditPreview />

      <div className='flex min-h-16 w-full items-center gap-4'>
        <div className='flex items-center gap-4 *:size-5 *:cursor-pointer'>
          <File />
        </div>
        <ColonPicker emojis={findedEmojis} show={open && findedEmojis.length > 0} onEmojiSelect={handleEmoji} />
        <input
          ref={mergedRef}
          value={text}
          placeholder='Write a message...'
          className='size-full text-2xl outline-none'
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <div className='flex items-center gap-2 *:cursor-pointer'>
          {/* svg gradient */}
          <svg width='0' height='0'>
            <linearGradient id='pink-purple-gradient' x1='100%' y1='100%' x2='0%' y2='0%'>
              <stop stopColor='#f6339a' offset='0%' />
              <stop stopColor='#ad46ff' offset='100%' />
            </linearGradient>
          </svg>

          <EmojiPicker onEmojiClick={handleEmoji} />

          {messageToEdit ? (
            <Check onClick={handleMessage} className='stroke-[url(#pink-purple-gradient)] duration-50' />
          ) : (
            <SendHorizontal onClick={handleMessage} className='duration-50 hover:stroke-[url(#pink-purple-gradient)]' />
          )}
        </div>
      </div>
    </div>
  );
};
