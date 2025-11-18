import { Module } from '@nestjs/common';
import { DeviceGateway } from './websocket.gateway';

@Module({
  providers: [DeviceGateway],
  exports: [DeviceGateway],
})
export class WebSocketModule {}
