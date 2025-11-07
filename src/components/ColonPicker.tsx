import { Emoji } from '@/hooks/useEmojis';
import { cn } from '@/utils/cn';
import { useHotkeys } from '@mantine/hooks';
import { animate, motion, Variants } from 'motion/react';
import { FC, useEffect, useRef, useState, WheelEvent } from 'react';

type ColonPickerProps = {
  emojis: Emoji[];
  show: boolean;
  onEmojiSelect: (emoji: Emoji) => void;
};

export const ColonPicker: FC<ColonPickerProps> = ({ emojis, show, onEmojiSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState(0);

  const handleScroll = (e: WheelEvent) => {
    if (!containerRef.current) return;
    e.preventDefault();
    const current = containerRef.current.scrollLeft;
    animate(current, current + e.deltaY, {
      duration: 0.15,
      onUpdate: (v) => (containerRef.current!.scrollLeft = v),
    });
  };

  const variants: Variants = {
    hidden: {
      opacity: 0,
      transitionEnd: {
        display: 'none',
      },
    },
    visible: {
      opacity: 1,
      display: 'flex',
    },
  };

  const handleArrowLeft = (e: KeyboardEvent) => {
    if (!show || selectedItem === 0) return;
    e.preventDefault();
    setSelectedItem((prev) => --prev);
    document
      .querySelector(`div[data-index="${selectedItem - 1}"]`)
      ?.scrollIntoView({ inline: 'center', behavior: 'smooth' });
  };

  const handleArrowRight = (e: KeyboardEvent) => {
    if (!show || selectedItem === emojis.length - 1) return;
    e.preventDefault();
    setSelectedItem((prev) => ++prev);
    document
      .querySelector(`div[data-index="${selectedItem + 1}"]`)
      ?.scrollIntoView({ inline: 'center', behavior: 'smooth' });
  };

  const handleEmojiSelect = (e: KeyboardEvent) => {
    if (!show) return;
    e.stopPropagation();
    onEmojiSelect(emojis[selectedItem]);
  };

  useHotkeys(
    [
      ['ArrowLeft', handleArrowLeft, { preventDefault: false }],
      ['ArrowRight', handleArrowRight, { preventDefault: false }],
      ['Enter', handleEmojiSelect],
      ['Tab', handleEmojiSelect],
    ],
    [],
  );

  useEffect(() => {
    if (!containerRef.current) return;
    setSelectedItem(0);
    containerRef.current.scroll({ left: 0 });
  }, [show]);

  return (
    <motion.div
      ref={containerRef}
      className='absolute -top-[calc(100%+32px)] left-1/2 flex max-w-[345px] -translate-x-1/2 gap-2 overflow-x-auto rounded-2xl
        bg-zinc-700 p-2'
      onWheel={handleScroll}
      variants={variants}
      initial={false}
      animate={show ? 'visible' : 'hidden'}
    >
      {emojis.map((emoji, index) => (
        <div
          key={index}
          data-index={index}
          className={cn('cursor-pointer rounded-xl p-2 text-2xl', { 'bg-zinc-800': selectedItem === index })}
          onClick={() => onEmojiSelect(emoji)}
        >
          {emoji.native}
        </div>
      ))}
    </motion.div>
  );
};
