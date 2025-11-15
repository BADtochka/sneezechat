import { Emoji } from '@/hooks/useEmojis';
import { AreaFile } from '@/types/AreaFile';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const preloadedEmojisAtom = atomWithStorage<Array<Emoji>>('emojis', [], undefined, { getOnInit: true });
export const droppedFileAtom = atom<AreaFile>({ showPreview: false });
