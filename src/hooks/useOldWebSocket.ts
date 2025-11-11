import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type SocketMessage<T = unknown> = {
  type: string;
  data: T;
};

type WSReadyState = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED';

type UseWebSocketReturn<T = unknown> = {
  readyState: WSReadyState;
  socketMessage: SocketMessage<T> | null;
  error: Event | null;
  connect: () => void;
  disconnect: () => void;
  send: <ST>(type: string, data: ST) => void;
};

export function useOldWebSocket<T>(): UseWebSocketReturn<T> {
  const url = 'ws://localhost:1337';
  const tryToRecon = true;
  const maxRetries = 5;
  const retryDelayMs = 500;

  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);

  const [readyState, setReadyState] = useState<WSReadyState>('CLOSED');
  const [socketMessage, setMessage] = useState<SocketMessage<T> | null>(null);
  const [error, setError] = useState<Event | null>(null);

  const closeSocket = useCallback(() => {
    if (!wsRef || !wsRef.current) return null;
    retriesRef.current = maxRetries + 1;
    setReadyState('CLOSED');

    wsRef.current.close();
    wsRef.current = null;
  }, []);

  const connect = useCallback(() => {
    closeSocket();
    setError(null);

    const ws = new WebSocket(url);
    wsRef.current = ws;
    setReadyState('CONNECTING');
    console.log('CONNECTING TO SOCKET');

    ws.onopen = () => {
      setReadyState('OPEN');
      console.log('WEBSOCKET IS CONNECTED');
      retriesRef.current = 0;
    };

    ws.onmessage = (evt: MessageEvent) => {
      const payload = JSON.parse(evt.data as string) as SocketMessage<T>;
      setMessage(payload);
    };

    ws.onerror = (evt) => {
      console.error('Something went wrong with socket');
      setError(evt);
    };

    ws.onclose = () => {
      setReadyState('CLOSED');
      console.log('WEBSOCKET IS DISCONNECTED');
      if (tryToRecon && retriesRef.current < maxRetries) {
        const delay = retryDelayMs * Math.pow(2, retriesRef.current);
        retriesRef.current += 1;
        window.setTimeout(() => connect(), delay);
      }
    };
  }, [url, tryToRecon, maxRetries, retryDelayMs, closeSocket]);

  const disconnect = useCallback(() => {
    closeSocket();
  }, [closeSocket]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const send = <T>(type: string, data: T) => {
    if (!wsRef.current) return null;
    wsRef.current.send(JSON.stringify({ type, data }));
  };

  const state: WSReadyState = useMemo(() => {
    if (!wsRef.current) return readyState;
    switch (wsRef.current.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'OPEN';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return readyState;
    }
  }, [readyState]);

  return { readyState: state, socketMessage, error, connect, disconnect, send };
}
