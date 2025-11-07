import { User } from '@/types/User';
import { atomWithStorage } from 'jotai/utils';

export const userAtom = atomWithStorage<User>('user', {
  id: '',
  name: '',
  nameColor: '',
  createdAt: new Date(),
});
