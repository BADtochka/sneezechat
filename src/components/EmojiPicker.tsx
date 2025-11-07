import { Emoji } from '@/hooks/useEmojis';
import { useClickOutside } from '@mantine/hooks';
import { ClientOnly } from '@tanstack/react-router';
import { Smile } from 'lucide-react';
import { motion, Variants } from 'motion/react';
import { FC, useState } from 'react';

type EmojiPickerProps = {
  onEmojiClick: (data: Emoji) => void;
};

export const EmojiPicker: FC<EmojiPickerProps> = ({}) => {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

  const variants: Variants = {
    closed: {
      opacity: 0,
      transitionEnd: {
        display: 'none',
      },
    },
    opened: {
      opacity: 1,
      display: 'flex',
    },
  };

  return (
    <ClientOnly>
      <div className='relative' ref={ref}>
        <Smile onClick={() => setOpen(!open)} />
        <motion.div
          variants={variants}
          initial={false}
          animate={open ? 'opened' : 'closed'}
          className='absolute right-0 bottom-12'
        >
          {/* <Picker onEmojiSelect={onEmojiClick} set='apple' emojiSize={32} /> */}
        </motion.div>
      </div>
    </ClientOnly>
  );
};
