import { io, Socket } from 'socket.io-client';
import type { WebSocketMessage } from '../types';

type MessageHandler = (message: WebSocketMessage) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private deviceId: string | null = null;
  private masjidId: string | null = null;

  connect(deviceId: string, masjidId?: string) {
    const wsUrl = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';

    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.deviceId = deviceId;
    this.masjidId = masjidId || null;

    this.socket = io(wsUrl, {
      auth: {
        deviceId,
        masjidId,
        type: 'tv-device',
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;

      // Register device with masjid room to receive broadcasts
      if (this.masjidId) {
        this.socket?.emit('device:register', {
          masjidId: this.masjidId,
          deviceId: this.deviceId,
        });
        console.log('Device registered with masjid:', this.masjidId);
      }

      this.notifyHandlers('connected', { type: 'connected' });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.notifyHandlers('disconnected', { type: 'disconnected' });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.notifyHandlers('connection_failed', { type: 'connection_failed' });
      }
    });

    // Listen for prayer times updates
    this.socket.on('prayer_times_updated', (data) => {
      this.notifyHandlers('prayer_times_updated', {
        type: 'prayer_times_updated',
        data,
      });
    });

    // Listen for announcement updates
    this.socket.on('announcement_updated', (data) => {
      this.notifyHandlers('announcement_updated', {
        type: 'announcement_updated',
        data,
      });
    });

    // Listen for content updates
    this.socket.on('content_updated', (data) => {
      this.notifyHandlers('content_updated', {
        type: 'content_updated',
        data,
      });
    });

    // Listen for template changes
    this.socket.on('template_changed', (data) => {
      this.notifyHandlers('template_changed', {
        type: 'template_changed',
        data,
      });
    });

    // Listen for refresh command
    this.socket.on('refresh', () => {
      this.notifyHandlers('refresh', {
        type: 'refresh',
      });
    });

    // Listen for device pairing
    this.socket.on('device_paired', (data) => {
      this.notifyHandlers('device_paired', {
        type: 'device_paired',
        data,
      });
    });

    // Listen for schedule updates
    this.socket.on('schedule:update', (data) => {
      console.log('Schedule update received:', data);
      this.notifyHandlers('schedule_updated', {
        type: 'content_updated',
        data,
      });
    });

    // Listen for announcement updates from backend
    this.socket.on('announcement:update', (data) => {
      console.log('Announcement update received:', data);
      this.notifyHandlers('announcement_updated', {
        type: 'announcement_updated',
        data,
      });
    });

    // Listen for content updates from backend
    this.socket.on('content:update', (data) => {
      console.log('Content update received:', data);
      this.notifyHandlers('content_updated', {
        type: 'content_updated',
        data,
      });
    });
  }

  private notifyHandlers(event: string, message: WebSocketMessage) {
    const eventHandlers = this.handlers.get(event);
    const allHandlers = this.handlers.get('*');

    if (eventHandlers) {
      eventHandlers.forEach((handler) => handler(message));
    }

    if (allHandlers) {
      allHandlers.forEach((handler) => handler(message));
    }
  }

  on(event: string, handler: MessageHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  off(event: string, handler: MessageHandler) {
    this.handlers.get(event)?.delete(handler);
  }

  emit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Cannot emit event: WebSocket not connected');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.handlers.clear();
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const wsService = new WebSocketService();
export default wsService;
