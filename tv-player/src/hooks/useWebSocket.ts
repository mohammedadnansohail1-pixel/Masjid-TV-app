import { useEffect, useCallback, useState, useRef } from 'react';
import { wsService } from '../services/websocket';
import type { WebSocketMessage } from '../types';

export const useWebSocket = (
  deviceId: string | null,
  masjidId: string | null,
  onMessage?: (message: WebSocketMessage) => void
) => {
  const [isConnected, setIsConnected] = useState(false);
  const onMessageRef = useRef(onMessage);

  // Keep ref updated with latest callback
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  // Initial connection setup - only reconnect when deviceId changes
  useEffect(() => {
    if (!deviceId) return;

    // Connect to WebSocket (handles initial masjidId if available)
    wsService.connect(deviceId, masjidId || undefined);

    // Listen for connection status
    const unsubscribeConnected = wsService.on('connected', () => {
      setIsConnected(true);
    });

    const unsubscribeDisconnected = wsService.on('disconnected', () => {
      setIsConnected(false);
    });

    // Listen for all messages using ref to avoid re-subscriptions
    const messageHandler = (message: WebSocketMessage) => {
      onMessageRef.current?.(message);
    };
    const unsubscribeMessages = wsService.on('*', messageHandler);

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeMessages();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]); // masjidId changes handled separately below

  // Update masjid registration when masjidId changes (without reconnecting)
  useEffect(() => {
    if (masjidId && wsService.isConnected()) {
      wsService.updateMasjidId(masjidId);
    }
  }, [masjidId]);

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
