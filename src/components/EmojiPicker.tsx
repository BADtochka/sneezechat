import { Emoji, useEmoji } from '@/hooks/useEmojis';
import { useClickOutside, useFocusTrap, useHover } from '@mantine/hooks';
import { ClientOnly } from '@tanstack/react-router';
import { motion, Variants } from 'motion/react';
import { FC, useEffect, useState } from 'react';

type EmojiPickerProps = {
  onEmojiClick: (data: Emoji) => void;
};

export const EmojiPicker: FC<EmojiPickerProps> = ({ onEmojiClick }) => {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  const { hovered, ref: emojiRef } = useHover();
  const { preloadedEmojis } = useEmoji();
  const inputRef = useFocusTrap(open);

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

  const [emojiIndexToShow, setEmojiIndexToShow] = useState(0);
  const emojis = ['😀', '😎', '🥸', '🤪', '🤡'];

  useEffect(() => {
    updateRandomEmoji();
  }, [hovered]);

  const updateRandomEmoji = () => {
    if (!hovered) return;
    let tempIndex = emojiIndexToShow + 1;
    if (tempIndex >= emojis.length) {
      tempIndex = 0;
    }
    setEmojiIndexToShow(tempIndex);
  };

  return (
    <ClientOnly>
      <div className='relative size-[2em]' ref={ref}>
        <div
          className='flex size-[32px] flex-row items-center justify-center rounded-sm text-[1.4em] filter-[grayscale(1)] duration-50
            hover:scale-110 hover:bg-zinc-700 hover:filter-none'
          onClick={() => setOpen(!open)}
          ref={emojiRef}
        >
          {emojis[emojiIndexToShow]}
        </div>
        <motion.div
          variants={variants}
          initial={false}
          animate={open ? 'opened' : 'closed'}
          className='absolute right-0 bottom-12 flex gap-4 rounded-2xl border border-zinc-600 bg-zinc-800 p-4 pr-0 text-2xl select-none'
        >
          <div className='flex flex-col justify-between gap-4'>
            <div>😎</div>
            <div>🍃</div>
            <div>🍔</div>
            <div>🎲</div>
            <div>🗺️</div>
            <div>💻</div>
            <div>➕</div>
            <div>🎌</div>
          </div>
          <div className='flex flex-col gap-4'>
            <div className='grid size-[450px] grid-cols-8 flex-wrap overflow-auto'>
              {preloadedEmojis.map((emoji) => (
                <div
                  key={emoji.name}
                  className='flex aspect-square items-center justify-center hover:bg-zinc-700'
                  onClick={() => onEmojiClick(emoji)}
                >
                  {emoji.native}
                </div>
              ))}
            </div>
            <input placeholder='Поиск' className='outline-none' ref={inputRef} />
          </div>
        </motion.div>
      </div>
    </ClientOnly>
  );
};
