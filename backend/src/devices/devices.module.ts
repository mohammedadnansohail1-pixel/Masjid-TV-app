import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { TvDevicesController } from './tv-devices.controller';
import { DevicesService } from './devices.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DevicesController, TvDevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
