import { useEffect, useCallback, useState } from 'react';
import { wsService } from '../services/websocket';
import type { WebSocketMessage } from '../types';

export const useWebSocket = (
  deviceId: string | null,
  masjidId: string | null,
  onMessage?: (message: WebSocketMessage) => void
) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!deviceId) return;

    // Connect to WebSocket
    wsService.connect(deviceId, masjidId || undefined);

    // Listen for connection status
    const unsubscribeConnected = wsService.on('connected', () => {
      setIsConnected(true);
    });

    const unsubscribeDisconnected = wsService.on('disconnected', () => {
      setIsConnected(false);
    });

    // Listen for all messages if handler provided
    let unsubscribeMessages: (() => void) | undefined;
    if (onMessage) {
      unsubscribeMessages = wsService.on('*', onMessage);
    }

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      if (unsubscribeMessages) {
        unsubscribeMessages();
      }
    };
  }, [deviceId, masjidId, onMessage]);

  const subscribe = useCallback((event: string, handler: (message: WebSocketMessage) => void) => {
    return wsService.on(event, handler);
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    wsService.emit(event, data);
  }, []);

  return {
    isConnected,
    subscribe,
    emit,
  };
};
