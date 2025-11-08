import { atomMessages, atomMessageToEdit } from '@/atoms/messages';
import { userAtom } from '@/atoms/user';
import { Emoji, useEmoji } from '@/hooks/useEmojis';
import { sendMessage } from '@/server/messages';
import { MessageRequest } from '@/types/Message';
import { tryCatch } from '@/utils/tryCatch';
import { useFocusTrap, useMergedRef } from '@mantine/hooks';
import { useAtom } from 'jotai';
import { File, SendHorizontal } from 'lucide-react';
import { ChangeEvent, FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { ColonPicker } from './ColonPicker';
import { EmojiPicker } from './EmojiPicker';

type ChatInputProps = {
  onMessageSend: () => void;
};

export const ChatInput: FC<ChatInputProps> = ({ onMessageSend }) => {
  const [user] = useAtom(userAtom);
  const [text, setText] = useState('');
  const [messages, setMessages] = useAtom(atomMessages);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const { findEmojis, findedEmojis, query } = useEmoji();
  const focusTrapRef = useFocusTrap();
  const mergedRef = useMergedRef(inputRef, focusTrapRef);
  const [messageToEdit, setMessageToEdit] = useAtom(atomMessageToEdit);

  const handleMessage = async () => {
    if (!inputRef.current || !text || !user) return;

    const newMessageData: MessageRequest = {
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
      setMessages([newMessage, ...messages]);
      onMessageSend();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const content = e.target.value;
    if (content.includes(':') && content.length > 2) {
      findEmojis(content);
      setOpen(true);
    } else if (open) {
      setOpen(false);
    }
    setText(content);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!inputRef.current) return;

    if (e.key === 'Enter') {
      handleMessage();
      return;
    }

    // inputRef.current.focus();
    // inputRef.current.selectionStart = inputRef.current.value.length;
    // inputRef.current.selectionEnd = inputRef.current.value.length;
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
    if (messageToEdit) {
      setText(messageToEdit.text);
    }
  }, [messageToEdit]);

  return (
    <div className='relative flex min-h-16 w-full items-center justify-end gap-4 bg-zinc-800 px-4'>
      <div className='flex items-center gap-4 *:size-5 *:cursor-pointer'>
        <File />
      </div>
      <ColonPicker emojis={findedEmojis} show={open && findedEmojis.length > 0} onEmojiSelect={handleEmoji} />
      <input
        ref={mergedRef}
        value={text}
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

        <SendHorizontal onClick={handleMessage} className='duration-50 hover:stroke-[url(#pink-purple-gradient)]' />
      </div>
    </div>
  );
};
