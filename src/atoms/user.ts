import { ServerToClient } from '@/types/Socket';
import { User } from '@/types/User';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const userAtom = atomWithStorage<User | null>('user', null, undefined, { getOnInit: true });
export const typingUsersAtom = atom<ServerToClient['user:typing'][]>([]);
