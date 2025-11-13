import { ClientToServer, ServerToClient } from '@/types/Socket';
import { WebSocket, WebSocketServer } from 'ws';
import events from './events';

const PORT = 1337;

type ClientEventCallback<T extends keyof ClientToServer> = (data: ClientToServer[T], socket: WebSocket) => void;

class WSServer {
  private wss: WebSocketServer;
  private listeners = new Map<keyof ClientToServer, Set<ClientEventCallback<any>>>();

  constructor() {
    this.wss = new WebSocketServer({ port: PORT, host: '0.0.0.0' });
    console.log(`[WS] Server started on port ${PORT}`);

    this.wss.on('connection', (socket) => {
      console.log('[WS] Client connected');
      this.send(socket, 'user:joined', { test: 'lol' });

      socket.on('message', (msg) => {
        try {
          const { type, data } = JSON.parse(msg.toString());
          this.emit(type, data, socket);
        } catch (e) {
          console.error('[WS] Invalid message:', msg.toString());
        }
      });

      socket.on('close', () => {
        console.log('[WS] Client disconnected');
      });
    });
  }

  on<T extends keyof ClientToServer>(event: T, callback: ClientEventCallback<T>) {
    console.log('✅ Event listener registered:', event);

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.clear();
    this.listeners.get(event)!.add(callback);
  }

  private emit<T extends keyof ClientToServer>(event: T, data: ClientToServer[T], socket: WebSocket) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data, socket);
        } catch (error) {
          console.error(`[WS] Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  send<T extends keyof ServerToClient>(socket: WebSocket, event: T, data: ServerToClient[T]) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: event, data }));
    }
  }

  broadcast<T extends keyof ServerToClient>(event: T, data: ServerToClient[T]) {
    console.log('broadcasting', event, data);

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: event, data }));
      }
    });
  }
}

// Глобальный синглтон
declare global {
  var __WSS__: WSServer | undefined;
}

export const wsServer = globalThis.__WSS__ ?? new WSServer();
if (!globalThis.__WSS__) globalThis.__WSS__ = wsServer;

events();
