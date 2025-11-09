import { Upload } from 'lucide-react';

export const FileDropOverlay = () => {
  return (
    <div
      className='drop_area pointer-events-none absolute z-1 flex size-full flex-col items-center justify-center bg-zinc-800 opacity-90
        select-none'
    >
      <Upload className='scale-200' />

      <div className='drop_area_text pt-3 text-3xl'>
        <p className='text_1'>Drop Here</p>
      </div>
    </div>
  );
};
