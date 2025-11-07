// src/server/ws.ts
import { WebSocket, WebSocketServer } from 'ws';

const PORT = 1337;

interface CustomSocketServer extends WebSocketServer {
  sendToClients: <T>(type: string, data: T) => void;
}

// Расширяем типизацию globalThis
declare global {
  // Чтобы TS не ругался на повторное объявление при HMR
  // eslint-disable-next-line no-var
  var __WSS__: CustomSocketServer | undefined;
}

if (!globalThis.__WSS__) {
  const wss = new WebSocketServer({ port: PORT, host: '0.0.0.0' }) as CustomSocketServer;

  console.log(`[WS] Server started on port ${PORT}`);

  wss.on('connection', (socket: WebSocket) => {
    console.log('[WS] Client connected');

    socket.send(JSON.stringify({ type: 'welcome' }));

    socket.on('message', (msg) => {
      console.log('[WS] Received:', msg.toString());
    });
  });

  globalThis.__WSS__ = wss;
} else {
  console.log(`[WS] Reusing existing WebSocketServer on port ${PORT}`);
}

export const sendToClients = <T>(type: string, data: T) => {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify({ type, data }));
  });
};
export const wss = globalThis.__WSS__!;
