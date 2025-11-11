import { AnimatePresence, motion, Variants } from 'motion/react';
import { forwardRef, JSX, PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

export type MenuItem = {
  label: string;
  icon?: JSX.Element;
  callback: () => void;
};

export type ContextMenuProps = {
  items: MenuItem[];
  open: boolean;
  onClose: (value: false) => void;
  coords: { x: number; y: number };
};

export const ContextMenu = forwardRef<HTMLDivElement, PropsWithChildren<ContextMenuProps>>(
  ({ children, items, open, onClose, coords }, ref) => {
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

    const handleItemClick = (callback: () => void) => {
      onClose(false);
      callback();
    };

    const menu = (
      <motion.div
        key='menu'
        ref={ref}
        initial='hidden'
        animate='visible'
        exit='hidden'
        variants={variants}
        style={{ y: coords.y, x: coords.x }}
        className='absolute top-0 left-0 z-100 flex min-w-[200px] flex-col rounded-2xl border border-zinc-700 bg-zinc-800 p-2 text-xl'
      >
        {items.map((item) => (
          <div
            key={item.label}
            onClick={() => handleItemClick(item.callback)}
            className='flex w-full cursor-pointer items-center gap-4 rounded-xl p-3 hover:bg-zinc-700/50'
          >
            {item.icon}
            {item.label}
          </div>
        ))}
      </motion.div>
    );

    return (
      <div className='w-full'>
        {createPortal(<AnimatePresence>{open && menu}</AnimatePresence>, document.body)}
        {children}
      </div>
    );
  },
);
