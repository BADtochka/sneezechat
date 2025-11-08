import { User } from '@/types/User';
import { atomWithStorage } from 'jotai/utils';

export const userAtom = atomWithStorage<User | null>('user', null, undefined, { getOnInit: true });
