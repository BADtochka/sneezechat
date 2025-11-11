import { ServerToClient } from '@/types/Socket';

// wsClient.ts
type EventCallback<T extends keyof ServerToClient> = (data: ServerToClient[T]) => void;

class WSClient {
  private socket: WebSocket;
  private listeners = new Map<keyof ServerToClient, Set<Function>>();

  constructor(url: string) {
    this.socket = new WebSocket(url);
    this.socket.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      this.emit(type, data);
    };
  }

  subscribe<T extends keyof ServerToClient>(event: T, callback: EventCallback<T>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)!.delete(callback);
    };
  }

  private emit<T extends keyof ServerToClient>(event: T, data: ServerToClient[T]) {
    this.listeners.get(event)?.forEach((cb) => (cb as EventCallback<T>)(data));
  }

  send<T extends keyof ServerToClient>(event: T, data: ServerToClient[T]) {
    this.socket.send(JSON.stringify({ type: event, data }));
  }
}

export const wsClient = new WSClient('ws://localhost:1337');
