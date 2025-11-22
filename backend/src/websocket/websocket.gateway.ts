import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface DeviceConnection {
  socketId: string;
  masjidId: string;
  deviceId?: string;
  pairingCode?: string;
  connectedAt: Date;
}

@WebSocketGateway({
  cors: {
    origin: '*', // Configure this based on your needs
    credentials: true,
  },
})
export class DeviceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DeviceGateway.name);
  private connectedDevices: Map<string, DeviceConnection> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedDevices.delete(client.id);
  }

  /**
   * Register a device connection
   */
  @SubscribeMessage('device:register')
  async handleDeviceRegister(
    @MessageBody() data: { masjidId: string; deviceId?: string; pairingCode?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const connection: DeviceConnection = {
      socketId: client.id,
      masjidId: data.masjidId,
      deviceId: data.deviceId,
      pairingCode: data.pairingCode,
      connectedAt: new Date(),
    };

    this.connectedDevices.set(client.id, connection);

    // Join masjid room for targeted broadcasts
    const room = `masjid:${data.masjidId}`;
    client.join(room);

    if (data.deviceId) {
      client.join(`device:${data.deviceId}`);
    }

    // Log registration details
    const socketsInRoom = await this.server.in(room).fetchSockets();
    this.logger.log(
      `Device registered: ${data.deviceId || data.pairingCode} for masjid ${data.masjidId} - Room ${room} now has ${socketsInRoom.length} clients`,
    );

    return {
      success: true,
      message: 'Device registered successfully',
    };
  }

  /**
   * Device heartbeat
   */
  @SubscribeMessage('device:heartbeat')
  handleDeviceHeartbeat(
    @MessageBody() data: { deviceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const connection = this.connectedDevices.get(client.id);

    if (connection) {
      connection.connectedAt = new Date();
      this.connectedDevices.set(client.id, connection);
    }

    return {
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Broadcast content update to all devices in a masjid
   */
  broadcastContentUpdate(masjidId: string, content: any) {
    this.logger.log(`Broadcasting content update to masjid: ${masjidId}`);

    this.server.to(`masjid:${masjidId}`).emit('content:update', {
      type: 'content_update',
      data: content,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast prayer time update to all devices in a masjid
   */
  broadcastPrayerTimeUpdate(masjidId: string, prayerTimes: any) {
    this.logger.log(`Broadcasting prayer time update to masjid: ${masjidId}`);

    this.server.to(`masjid:${masjidId}`).emit('prayerTime:update', {
      type: 'prayer_time_update',
      data: prayerTimes,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast announcement update to all devices in a masjid
   */
  async broadcastAnnouncementUpdate(masjidId: string, announcement?: any) {
    const room = `masjid:${masjidId}`;
    const sockets = await this.server.in(room).fetchSockets();
    this.logger.log(`Broadcasting announcement update to room ${room} - ${sockets.length} clients connected`);

    this.server.to(room).emit('announcement:update', {
      type: 'announcement_update',
      data: announcement,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast schedule update to all devices in a masjid
   */
  async broadcastScheduleUpdate(masjidId: string, schedule?: any) {
    const room = `masjid:${masjidId}`;
    const sockets = await this.server.in(room).fetchSockets();
    this.logger.log(`Broadcasting schedule update to room ${room} - ${sockets.length} clients connected`);

    this.server.to(room).emit('schedule:update', {
      type: 'schedule_update',
      data: schedule,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send message to specific device
   */
  sendToDevice(deviceId: string, event: string, data: any) {
    this.logger.log(`Sending ${event} to device: ${deviceId}`);

    this.server.to(`device:${deviceId}`).emit(event, {
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send reload command to device
   */
  reloadDevice(deviceId: string) {
    this.logger.log(`Sending reload command to device: ${deviceId}`);

    this.server.to(`device:${deviceId}`).emit('device:reload', {
      message: 'Reload requested',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send template change to device
   */
  changeDeviceTemplate(deviceId: string, template: string) {
    this.logger.log(`Changing template for device ${deviceId} to ${template}`);

    this.server.to(`device:${deviceId}`).emit('device:template-change', {
      template,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get all connected devices for a masjid
   */
  getConnectedDevices(masjidId: string): DeviceConnection[] {
    const devices: DeviceConnection[] = [];

    this.connectedDevices.forEach((connection) => {
      if (connection.masjidId === masjidId) {
        devices.push(connection);
      }
    });

    return devices;
  }

  /**
   * Get total connected devices count
   */
  getConnectedDevicesCount(): number {
    return this.connectedDevices.size;
  }

  /**
   * Check if device is connected
   */
  isDeviceConnected(deviceId: string): boolean {
    for (const [_, connection] of this.connectedDevices) {
      if (connection.deviceId === deviceId) {
        return true;
      }
    }
    return false;
  }
}
