import { cn } from '@/utils/cn';
import { AnimatePresence } from 'motion/react';
import { DragEvent, FC, PropsWithChildren, useState } from 'react';
import { FileDropOverlay } from './FileDropOverlay';

type FileDropAreaProps = {
  accept?: string[];
};

export const FileDropArea: FC<PropsWithChildren<FileDropAreaProps>> = ({ children }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [status, setStatus] = useState<'accepted' | 'rejected' | 'waiting'>('waiting');

  const _onDrop = (event: DragEvent<HTMLDivElement>, active: boolean) => {
    if (!Array.from(event.dataTransfer.types).includes('Files')) return;
    event.stopPropagation();
    event.preventDefault();

    const items = event.dataTransfer.items;

    for (const item of items) {
      const entry = item.webkitGetAsEntry();

      if (entry) {
        console.log(entry);
      }
    }

    setShowOverlay(false);
    // for (const file of files) {
    // console.log(event.dataTransfer);
    // }

    // Array.from(files).forEach((file) => {
    //   if (accept && !accept.includes(file.type)) {
    //     setStatus('rejected');
    //     return;
    //   }

    //   setStatus('accepted');
    // });

    // delay(() => setShowOverlay(false), 500);
  };

  const _onDrag = (event: DragEvent<HTMLDivElement>, active: boolean) => {
    if (!Array.from(event.dataTransfer.types).includes('Files')) return;
    event.stopPropagation();
    event.preventDefault();

    setStatus('waiting');
    setShowOverlay(active);
  };

  return (
    <div
      onDrop={(event) => _onDrop(event, false)}
      onDragOver={(event) => _onDrag(event, true)}
      onDragLeave={(event) => _onDrag(event, false)}
      className={cn('h-full overflow-hidden', {
        // '*:pointer-events-none': showOverlay,
      })}
    >
      {children}
      <AnimatePresence>{showOverlay && <FileDropOverlay status={status} />}</AnimatePresence>
    </div>
  );
};
