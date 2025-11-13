import { Emoji, EmojiCategory, useEmoji } from '@/hooks/useEmojis';
import { useClickOutside, useFocusTrap, useHover } from '@mantine/hooks';
import { ClientOnly } from '@tanstack/react-router';
import { motion, Variants } from 'motion/react';
import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import { default as emojis } from 'unicode-emoji-json';
import { getObjectKeys } from '../utils/getObjectKeys';
type EmojiPickerProps = {
  onEmojiClick: (data: Emoji) => void;
};

export const EmojiPicker: FC<EmojiPickerProps> = ({ onEmojiClick }) => {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  const { hovered, ref: emojiRef } = useHover();
  const [emojiIndexToShow, setEmojiIndexToShow] = useState(0);
  const { categorizedEmojis, findedEmojis, findEmojiByPicker } = useEmoji();
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useFocusTrap(open);
  const containerRef = useRef<HTMLDivElement>(null);
  const PICKER_EMOJIS = ['😀', '😎', '🥸', '🤪', '🤡'];

  const categoriesEmoji: Record<EmojiCategory, keyof typeof emojis> = {
    'Smileys & Emotion': '😀',
    'People & Body': '💻',
    'Animals & Nature': '🍃',
    'Food & Drink': '🍔',
    'Travel & Places': '🗺️',
    Activities: '🎲',
    Objects: '🧩',
    Symbols: '➕',
    Flags: '🎌',
  };

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

  useEffect(() => {
    updateRandomEmoji();
  }, [hovered]);

  useEffect(() => {
    findEmojiByPicker(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    !open && setSearchQuery('');
  }, [open]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const updateRandomEmoji = () => {
    if (!hovered) return;
    let tempIndex = emojiIndexToShow + 1;
    if (tempIndex >= PICKER_EMOJIS.length) {
      tempIndex = 0;
    }
    setEmojiIndexToShow(tempIndex);
  };

  const handleCategorySet = (category: EmojiCategory) => {
    const categorySection = document.getElementById(category) as HTMLDivElement;
    categorySection.scrollIntoView({ block: 'start' });
  };

  return (
    <ClientOnly>
      <div className='relative size-[2em]' ref={ref}>
        <div
          className='flex size-8 cursor-pointer flex-row items-center justify-center rounded-sm text-[1.4em] filter-[grayscale(1)]
            duration-50 hover:scale-110 hover:bg-zinc-700 hover:filter-none'
          onClick={() => setOpen(!open)}
          ref={emojiRef}
        >
          {PICKER_EMOJIS[emojiIndexToShow]}
        </div>
        <motion.div
          variants={variants}
          initial={false}
          animate={open ? 'opened' : 'closed'}
          className='absolute right-0 bottom-16 flex gap-4 overflow-hidden rounded-2xl border border-zinc-600 bg-zinc-800 pt-4 text-2xl
            select-none max-md:fixed max-md:bottom-20 max-md:w-full'
        >
          <div className='flex flex-col justify-between pb-4'>
            {getObjectKeys(categoriesEmoji).map((key) => (
              <div
                key={key}
                onClick={() => handleCategorySet(key)}
                className='flex h-full cursor-pointer items-center justify-center rounded-tr-2xl rounded-br-2xl p-2 hover:bg-zinc-600'
              >
                {categoriesEmoji[key]}
              </div>
            ))}
          </div>
          <div className='flex size-[450px] flex-col'>
            <div className='grow overflow-auto max-md:w-full' ref={containerRef}>
              {findedEmojis.length > 0 ? (
                <div className='grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))]'>
                  {findedEmojis.map((emoji) => (
                    <div
                      key={emoji.slug}
                      className='flex aspect-square cursor-pointer items-center justify-center hover:bg-zinc-700/50'
                      onClick={() => onEmojiClick(emoji)}
                    >
                      {emoji.native}
                    </div>
                  ))}
                </div>
              ) : (
                getObjectKeys(categorizedEmojis).map((key) => (
                  <div key={key} className='flex flex-col gap-2 whitespace-nowrap'>
                    <p id={key}>{key}</p>
                    <div className='grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))]'>
                      {categorizedEmojis[key as EmojiCategory].map((emoji) => (
                        <div
                          key={emoji.slug}
                          className='flex aspect-square cursor-pointer items-center justify-center hover:bg-zinc-700/50'
                          onClick={() => onEmojiClick(emoji)}
                        >
                          {emoji.native}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
            <input
              placeholder='Поиск'
              onChange={handleChange}
              value={searchQuery}
              className='h-[60px] shrink-0 outline-none'
              ref={inputRef}
            />
          </div>
        </motion.div>
      </div>
    </ClientOnly>
  );
};
