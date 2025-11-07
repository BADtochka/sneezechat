import { MessageData } from '@/types/Message';
import { Trash } from 'lucide-react';
import { Variants } from 'motion/react';
import * as motion from 'motion/react-client';
import { FC } from 'react';

type MessageProps = {
  data: MessageData;
  handleDeleteMessage: (idToDelete: string) => Promise<void>;
};

export const Message: FC<MessageProps> = ({ data, handleDeleteMessage }) => {
  const variants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      scale: 1,
    },
    deleted: {
      opacity: 0,
      scale: 0.9,
    },
  };

  return (
    <motion.div
      layout
      variants={variants}
      initial='hidden'
      animate='visible'
      exit='deleted'
      className='group flex w-1/2 flex-col gap-2 rounded-2xl bg-zinc-800 p-4'
    >
      <div className='flex items-center justify-between gap-2'>
        <p className='line-clamp-1 text-xl font-bold'>{data.author}</p>
        <Trash
          className='shrink-0 cursor-pointer text-zinc-500 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:text-red-500'
          onClick={() => handleDeleteMessage(data.id)}
        />
      </div>
      <div className='text-xl wrap-break-word'>{data.text}</div>
    </motion.div>
  );
};
