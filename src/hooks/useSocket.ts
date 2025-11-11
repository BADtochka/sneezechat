// useServer.ts
import { ServerToClient } from '@/types/Socket';
import { wsClient } from '@/utils/wsClient';

export function useSocket() {
  function subscribe<T extends keyof ServerToClient>(event: T, callback: (data: ServerToClient[T]) => void) {
    return wsClient.subscribe(event, callback);
  }

  function send<T extends keyof ServerToClient>(event: T, data: ServerToClient[T]) {
    wsClient.send(event, data);
  }

  return { subscribe, send };
}
