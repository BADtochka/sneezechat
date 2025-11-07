import { MessageData } from '@/types/Message';
import { atom } from 'jotai';

export const atomMessages = atom<MessageData[]>([]);
