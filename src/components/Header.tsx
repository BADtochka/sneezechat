import { userAtom } from '@/atoms/user';
import { useNavigate } from '@tanstack/react-router';
import { useAtom } from 'jotai';
import { LogOut } from 'lucide-react';

export const Header = () => {
  const [user, setUser] = useAtom(userAtom);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate({ to: '/auth' });
  };

  if (!user) return null;

  return (
    <div className='flex items-center justify-end gap-4 bg-zinc-800 p-4 text-2xl border-b border-[#313131]'>
      <p style={{ color: user.nameColor ?? 'white' }}>{user.name}</p>
      <LogOut className='size-11 cursor-pointer p-2' onClick={handleLogout} />
    </div>
  );
};
