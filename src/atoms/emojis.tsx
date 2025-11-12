import { Emoji } from '@/hooks/useEmojis';
import { atomWithStorage } from 'jotai/utils';

export const preloadedEmojisAtom = atomWithStorage<Array<Emoji>>('emojis', [], undefined, { getOnInit: true });
