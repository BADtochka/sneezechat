import { atomMessageContextCoords, atomMessageContextMenu } from '@/atoms/messages';
import { userAtom } from '@/atoms/user';
import { MessageData } from '@/types/Message';
import { useAtom } from 'jotai';
import { Variants } from 'motion/react';
import * as motion from 'motion/react-client';
import { FC, MouseEvent } from 'react';
import { cn } from '../utils/cn';
import { Author } from './Author';

type MessageProps = {
  data: MessageData;
};

export const Message: FC<MessageProps> = ({ data: message }) => {
  const [user] = useAtom(userAtom);
  const [contextMenuMessage, setContextMenuMessage] = useAtom(atomMessageContextMenu);
  const [_coords, setMemorizedCoords] = useAtom(atomMessageContextCoords);

  const onContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    setContextMenuMessage(message);
    setMemorizedCoords({ x: event.clientX, y: event.clientY });
  };

  const variants: Variants = {
    hidden: (userAuthor: boolean) => ({
      opacity: 0,
      scale: 0.9,
      x: userAuthor ? 100 : -100,
    }),

    visible: { opacity: 1, scale: 1, x: 0 },
    deleted: { opacity: 0, scale: 0.9 },
  };

  if (!user) return null;

  return (
    <motion.div
      layout
      onContextMenu={onContextMenu}
      variants={variants}
      initial='hidden'
      animate='visible'
      exit='deleted'
      id={message.id}
      className={cn('flex w-[60%] flex-col gap-2 rounded-2xl bg-zinc-800 p-4 transition-colors duration-300', {
        'ml-auto': message.author.id === user!.id,
        'bg-zinc-600': contextMenuMessage && contextMenuMessage.id === message.id,
      })}
      custom={message.author.id === user.id}
    >
      <Author data={message} />
      <p className='text-xl wrap-break-word'>{message.text}</p>
    </motion.div>
  );
};
