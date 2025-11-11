import { atomMessageToEdit } from '@/atoms/messages';
import { userAtom } from '@/atoms/user';
import { MessageData } from '@/types/Message';
import { cn } from '@/utils/cn';
import { useClickOutside } from '@mantine/hooks';
import { useAtom } from 'jotai';
import { Pen, Trash } from 'lucide-react';
import { Variants } from 'motion/react';
import * as motion from 'motion/react-client';
import { FC, MouseEvent, useState } from 'react';
import { Author } from './Author';
import { ContextMenu } from './ContextMenu';

type MessageProps = {
  data: MessageData;
  handleDeleteMessage: (idToDelete: string) => Promise<void>;
};

export const Message: FC<MessageProps> = ({ data: message, handleDeleteMessage }) => {
  const [user] = useAtom(userAtom);
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  const [memorizedCoords, setMemorizedCoords] = useState({ x: 0, y: 0 });
  const [_, setMessageToEdit] = useAtom(atomMessageToEdit);

  const onContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    setOpen(true);
    setMemorizedCoords({ x: event.clientX, y: event.clientY });
  };

  const variants: Variants = {
    hidden: (userAuthor: boolean) => ({
      opacity: 0,
      scale: 0.9,
      x: userAuthor ? 100 : -100,
    }),

    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
    },
    deleted: {
      opacity: 0,
      scale: 0.9,
    },
  };

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
        'bg-zinc-600': open,
      })}
      custom={message.author.id === user!.id}
    >
      <Author data={message} />
      <p className='text-xl wrap-break-word'>{message.text}</p>
      <ContextMenu
        ref={ref}
        open={open}
        onClose={setOpen}
        coords={memorizedCoords}
        items={[
          {
            label: 'Редактировать',
            icon: <Pen />,
            callback: () => setMessageToEdit(message),
          },
          {
            label: 'Удалить',
            icon: <Trash />,
            callback: () => handleDeleteMessage(message.id),
          },
        ]}
      />
    </motion.div>
  );
};
