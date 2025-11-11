import { Upload } from 'lucide-react';
import { motion, Variants } from 'motion/react';
import { FC } from 'react';

type FileDropOverlayProps = {
  status: 'accepted' | 'rejected' | 'waiting';
};

export const FileDropOverlay: FC<FileDropOverlayProps> = ({ status }) => {
  const variants: Variants = {
    hidden: { opacity: 0 },
    waiting: { opacity: 1, borderColor: '#3b82f6' },
    accepted: { opacity: 1, borderColor: '#22c55e' },
    rejected: { opacity: 1, borderColor: '#ef4444' },
  };

  return (
    <motion.div
      variants={variants}
      initial='hidden'
      animate={status}
      exit='hidden'
      className='pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 border border-transparent
        bg-zinc-800/90 select-none'
    >
      <Upload className='scale-200' />
      <p className='text-3xl'>Закидывай сюда БАЛЯ</p>
    </motion.div>
  );
};
