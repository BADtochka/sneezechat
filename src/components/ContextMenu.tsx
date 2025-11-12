import { AnimatePresence, motion, Variants } from 'motion/react';
import { FC, JSX, PropsWithChildren, Ref } from 'react';
import { createPortal } from 'react-dom';

export type MenuItem = {
  label: string;
  icon?: JSX.Element;
  callback: () => void;
};

export type ContextMenuProps = {
  items: MenuItem[];
  contextMenuIsOpen: boolean;
  onClose: (value: false) => void;
  coords: { x: number; y: number };
  ref?: Ref<HTMLDivElement>;
};

export const ContextMenu: FC<PropsWithChildren<ContextMenuProps>> = ({
  children,
  items,
  contextMenuIsOpen,
  onClose,
  coords,
  ref,
}) => {
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
      id='message-context-menu'
      className='fixed top-0 left-0 z-100 flex min-w-[200px] flex-col rounded-2xl border border-zinc-700 bg-zinc-800 p-2 text-xl'
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
      {createPortal(<AnimatePresence>{contextMenuIsOpen && menu}</AnimatePresence>, document.body)}
      {children}
    </div>
  );
};
