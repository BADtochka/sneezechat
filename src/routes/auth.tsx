import { userAtom } from '@/atoms/user';
import { ColorPicker } from '@/components/ColorPicker';
import { createUser } from '@/server/createUser';
import { User } from '@/types/User';
import { cn } from '@/utils/cn';
import { tryCatch } from '@/utils/tryCatch';
import { useHotkeys } from '@mantine/hooks';
import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/auth')({
  ssr: 'data-only',
  component: RouteComponent,
});

export const nicknameAtom = atomWithStorage<string>('chatusername', '');
export const nicknameColorAtom = atomWithStorage<string>('chatcolor', '#fff');

function RouteComponent() {
  const navigate = useNavigate();
  const [showSpinner, setShowSpinner] = useState(false);
  const [user, setUser] = useAtom(userAtom);
  const [nickname, setUsername] = useAtom(nicknameAtom);
  const [nickNameColor, setNickNameColor] = useAtom(nicknameColorAtom);
  const [hydrated, setHydrated] = useState(false);
  const minNicknameLength = 3;

  useHotkeys([['Enter', () => handleEnterButton()]], []);
  useEffect(() => setHydrated(true), []);

  const handleEnterButton = async () => {
    if (nickname.length < minNicknameLength) return;

    const newUser = {
      name: nickname,
      nameColor: nickNameColor,
    } as User;

    setShowSpinner(!showSpinner);

    const { data } = await tryCatch(createUser({ data: newUser }));
    if (data) {
      setUser(data);
      navigate({ to: '/' });
    }
  };

  const handleColorChange = (hexColor: string) => {
    setNickNameColor(hexColor);
  };

  if (user) return <Navigate to='/' />;
  return (
    <div className='flex h-screen flex-col items-center justify-center *:text-2xl'>
      <div className='flex max-w-[80vw] flex-col items-center gap-[1em] rounded-l bg-[#101011] p-[1.5em]'>
        <div className=''>Your Nickname</div>
        <div className='relative flex flex-row'>
          <input
            placeholder='Type Here'
            className='w-full bg-zinc-800 px-2 outline-0 placeholder:text-inherit'
            style={{ color: nickNameColor }}
            value={nickname}
            onChange={(e) => setUsername(e.currentTarget.value)}
            type='text'
          />
          <ColorPicker onColorChange={handleColorChange} />
        </div>
        <button
          disabled={hydrated && nickname.length < minNicknameLength}
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
                'group-hover:bg-transparent': nickname.length >= minNicknameLength,
                'cursor-not-allowed': nickname.length < minNicknameLength,
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
