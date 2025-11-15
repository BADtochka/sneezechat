import { File, Trash } from 'lucide-react';
import { motion, Variants } from 'motion/react';
import { FC } from 'react';

type FileProps = {
  file: File;
  onDelete: () => void;
};

export const FilePreview: FC<FileProps> = ({ file, onDelete }) => {
  const splittedName = file.name.split('.');
  const localUrl = URL.createObjectURL(file);

  const variants: Variants = {
    hidden: {
      height: 0,
      overflow: 'hidden',
      borderColor: 'rgba(63 63 70 / 0)',
    },
    visible: {
      height: '100%',
      borderColor: 'rgba(63 63 70 / 1)',
      transition: {
        padding: {
          delay: 0,
        },
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial='hidden'
      animate='visible'
      exit='hidden'
      className='group relative h-full w-fit rounded-xl border border-zinc-700 bg-zinc-900'
    >
      <div className='flex h-full w-34 flex-col justify-between p-4'>
        {file.type.includes('image') ? (
          <img src={localUrl} className='size-15 object-contain' alt='' />
        ) : (
          <File className='flex size-10 shrink-0 -translate-x-2' />
        )}
        {file.name.length > 10 ? (
          <div className='flex items-center justify-between whitespace-nowrap'>
            <p className='relative'>
              {splittedName[0].slice(0, 8)}
              <span className='absolute right-0 -bottom-1 h-8 w-10 bg-linear-to-r from-zinc-900/20 to-zinc-900 to-90%' />
            </p>
            <p>.{splittedName.pop()}</p>
          </div>
        ) : (
          file.name
        )}
        <div
          className='absolute top-2 right-2 cursor-pointer rounded-md bg-red-700 p-1.5 opacity-0 transition-opacity group-hover:opacity-100'
          onClick={onDelete}
        >
          <Trash className='size-4' />
        </div>
      </div>
    </motion.div>
  );
};
