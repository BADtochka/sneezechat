import { atomMessages } from '@/atoms/messages';
import { userAtom } from '@/atoms/user';
import { Emoji, useEmoji } from '@/hooks/useEmojis';
import { sendMessage } from '@/server/messages';
import { MessageData } from '@/types/Message';
import { tryCatch } from '@/utils/tryCatch';
import { useFocusTrap, useMergedRef } from '@mantine/hooks';
import { atom, useAtom } from 'jotai';
import { File, SendHorizontal } from 'lucide-react';
import { ChangeEvent, KeyboardEvent, useRef, useState } from 'react';
import { ColonPicker } from './ColonPicker';
import { EmojiPicker } from './EmojiPicker';

const textAtom = atom('');

export const ChatInput = () => {
  const [user] = useAtom(userAtom);
  const [text, setText] = useAtom(textAtom);
  const [messages, setMessages] = useAtom(atomMessages);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const { findEmojis, findedEmojis, query } = useEmoji();
  const focusTrapRef = useFocusTrap();
  const mergedRef = useMergedRef(inputRef, focusTrapRef);

  const handleMessage = async () => {
    if (!inputRef.current || !text) return;

    const newMessageData: Pick<MessageData, 'author' | 'text'> = {
      author: user.id,
      text: text,
    };

    const { data, error } = await tryCatch(sendMessage({ data: newMessageData }));

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setText('');
      setMessages([...messages, data]);
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
      <div className='flex items-center gap-4 *:size-5 *:cursor-pointer'>
        <EmojiPicker onEmojiClick={handleEmoji} />
        <SendHorizontal onClick={handleMessage} />
      </div>
    </div>
  );
};
