import { userAtom } from '@/atoms/user';
import { createUser } from '@/server/createUser';
import { User } from '@/types/User';
import { cn } from '@/utils/cn';
import { tryCatch } from '@/utils/tryCatch';
import { useHotkeys } from '@mantine/hooks';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAtom } from 'jotai';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/user/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [showSpinner, setShowSpinner] = useState(false);
  const [_, setUser] = useAtom(userAtom);
  const [nickname, setUsername] = useState('');
  const navigate = useNavigate();
  useHotkeys([['Enter', () => handleEnterButton()]], []);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const handleEnterButton = async () => {
    if (!nickname) return;

    const newUser = {
      name: nickname,
      nameColor: '#ff0000',
    } as User;
    setShowSpinner(!showSpinner);

    const { data } = await tryCatch(createUser({ data: newUser }));
    if (data) {
      setUser(data);
      navigate({ to: '/' });
    }
  };

  return (
    <div className='flex h-screen flex-col items-center justify-center overflow-hidden *:text-2xl'>
      <div className='flex w-[20em] flex-col items-center gap-[1em] overflow-hidden rounded-l bg-zinc-800 p-[1.5em]'>
        <div className=''>Your Nickname</div>
        <input
          className='w-[15em] bg-gray-500 px-2 outline-0'
          value={nickname}
          onChange={(e) => setUsername(e.currentTarget.value)}
          type='text'
        />
        <button
          disabled={!hydrated || nickname.length < 4}
          onClick={handleEnterButton}
          className='group relative me-2 mb-2 inline-flex items-center justify-center overflow-hidden rounded-lg bg-linear-to-br
            from-purple-500 to-pink-500 p-0.5 font-medium text-gray-900 outline-0 not-disabled:hover:text-white disabled:opacity-50
            dark:text-white'
        >
          <span
            className={cn(
              `relative flex h-[1.75em] cursor-pointer items-center rounded-md bg-white px-10 py-1.25 transition-all duration-75
              ease-in dark:bg-gray-900`,
              {
                'group-hover:bg-transparent': nickname.length >= 4,
                'cursor-not-allowed': nickname.length < 4,
              },
            )}
          >
            {showSpinner ? <LoaderCircle className='animate-spin' /> : 'Enter'}
          </span>
        </button>
      </div>
    </div>
  );
}
