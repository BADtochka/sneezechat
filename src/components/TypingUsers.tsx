import { ServerToClient } from '@/types/Socket';
import { motion, Variants } from 'motion/react';
import { FC } from 'react';

type TypingProps = {
  users: ServerToClient['user:typing'][];
};

export const TypingUsers: FC<TypingProps> = ({ users }) => {
  const variants: Variants = {
    hidden: {
      opacity: 0,
      height: 0,
    },
    visible: {
      opacity: 1,
      height: 30,
    },
  };

  const userNamesString = users.map((user) => user.name).join(users.length === 2 ? ' и ' : ', ');
  let typingString = userNamesString + (users.length > 1 ? ' печатают' : ' печатает') + '...';

  return (
    <motion.div
      initial={false}
      className='shrink-0 overflow-hidden px-2'
      variants={variants}
      animate={users.length > 0 ? 'visible' : 'hidden'}
    >
      {users.length > 0 && <p className='text-sm text-zinc-500 italic'>{typingString}</p>}
    </motion.div>
  );
};
