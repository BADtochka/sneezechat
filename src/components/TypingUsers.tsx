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

  const twoTyping = users.map((user) => user.name).join(' и ');
  const threeAndMoreTyping = users.map((user) => user.name).join(', ');
  const currentTypingUsers = users.filter((user) => user.typing);

  // BAD печатает (анимация появления)
  // юзер перестал печатать
  // BAD печатает (анимация скрытия)
  return (
    <motion.div
      initial={false}
      className='shrink-0 overflow-hidden'
      variants={variants}
      animate={currentTypingUsers.length > 0 ? 'visible' : 'hidden'}
    >
      {currentTypingUsers.length > 1 ? (
        <p>🐸 FIXME {`${currentTypingUsers.length > 2 ? threeAndMoreTyping : twoTyping} печатают`}</p>
      ) : (
        currentTypingUsers.length > 0 && (
          <p>🐸 FIXME {`${currentTypingUsers.map((user) => user.name).join(' ')} печатает`}</p>
        )
      )}
    </motion.div>
  );
};
