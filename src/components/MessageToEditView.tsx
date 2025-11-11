import { atomMessageToEdit } from '@/atoms/messages';
import { useAtom } from 'jotai';
import { Pencil, X } from 'lucide-react';
import { MouseEvent } from 'react';

export const MessageToEditPreview = () => {
  const [messageToEdit, setMessageToEdit] = useAtom(atomMessageToEdit);

  const handleCrossClick = (event: MouseEvent<SVGSVGElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setMessageToEdit(null);
  };

  const handleClickOnMessage = () => {
    const MSGElem = document.getElementById(messageToEdit!.id);
    MSGElem?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    MSGElem?.classList.remove('bg-zinc-800');
    MSGElem?.classList.add('bg-zinc-600');

    setTimeout(() => {
      MSGElem?.classList.remove('bg-zinc-600');
      MSGElem?.classList.add('bg-zinc-800');
      console.log('removed');
    }, 1000);
  };

  return (
    <>
      {messageToEdit && (
        <div
          className='flex cursor-pointer flex-row items-center gap-4 pt-1 select-none'
          onClick={handleClickOnMessage}
        >
          <div className='flex items-center gap-4 *:size-5'>
            <Pencil />
          </div>
          <div className='line-clamp-1 flex flex-1 flex-col'>
            <div className='bg-linear-65 from-pink-500 to-purple-500 bg-clip-text text-transparent'>Edit message</div>
            <div>{messageToEdit.text}</div>
          </div>
          <X
            onClick={(event) => handleCrossClick(event)}
            className='duration-50 hover:stroke-[url(#pink-purple-gradient)]'
          />
        </div>
      )}
    </>
  );
};
//👍
