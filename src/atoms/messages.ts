import { MessageData } from '@/types/Message';
import { atom } from 'jotai';

type ContextMenuCoords = {
  x: number;
  y: number;
};

export const atomMessages = atom<MessageData[]>([]);

export const atomMessageToEdit = atom<MessageData | null>();

export const atomMessageContextMenu = atom<MessageData | null>(null);
export const atomMessageContextCoords = atom<ContextMenuCoords>({ x: 0, y: 0 });
