import { droppedFileAtom } from '@/atoms/system';
import { useAtom } from 'jotai';
import { AnimatePresence } from 'motion/react';
import { DragEvent, FC, PropsWithChildren, useRef, useState } from 'react';
import { cn } from '../utils/cn';
import { FileDropOverlay } from './FileDropOverlay';

type FileDropAreaProps = {
  accept?: string[];
};

export const FileDropArea: FC<PropsWithChildren<FileDropAreaProps>> = ({ children }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [_, setDroppedFile] = useAtom(droppedFileAtom);
  const [status, setStatus] = useState<'accepted' | 'rejected' | 'waiting'>('waiting');
  const dragCounterRef = useRef(0);

  const containsFiles = (event: DragEvent<HTMLDivElement>) => Array.from(event.dataTransfer.types).includes('Files');
  const resetDragState = () => {
    dragCounterRef.current = 0;
    setShowOverlay(false);
  };

  const _onDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!containsFiles(event)) return;
    event.stopPropagation();
    event.preventDefault();

    const files = Array.from(event.dataTransfer.files);

    if (files.length > 1) return;

    setDroppedFile({ file: files[0], showPreview: true });
    resetDragState();
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

  const _onDragEnter = (event: DragEvent<HTMLDivElement>) => {
    if (!containsFiles(event)) return;
    event.stopPropagation();
    event.preventDefault();

    dragCounterRef.current += 1;
    setStatus('waiting');
    setShowOverlay(true);
  };

  const _onDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (!containsFiles(event)) return;
    event.stopPropagation();
    event.preventDefault();

    dragCounterRef.current = Math.max(dragCounterRef.current - 1, 0);

    if (dragCounterRef.current === 0) {
      setShowOverlay(false);
    }
  };

  const _onDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!containsFiles(event)) return;
    event.stopPropagation();
    event.preventDefault();

    setStatus('waiting');
    setShowOverlay(true);
  };

  return (
    <div
      onDrop={_onDrop}
      onDragOver={_onDragOver}
      onDragEnter={_onDragEnter}
      onDragLeave={_onDragLeave}
      className={cn('flex flex-1 flex-col overflow-hidden', {
        '*:pointer-events-none': showOverlay,
      })}
    >
      {children}
      <AnimatePresence>{showOverlay && <FileDropOverlay status={status} />}</AnimatePresence>
    </div>
  );
};
