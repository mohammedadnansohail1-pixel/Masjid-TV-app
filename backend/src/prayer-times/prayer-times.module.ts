import { Module } from '@nestjs/common';
import { PrayerTimesController } from './prayer-times.controller';
import { PrayerTimesService } from './prayer-times.service';
import { AladhanApiService } from './aladhan-api.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PrayerTimesController],
  providers: [PrayerTimesService, AladhanApiService],
  exports: [PrayerTimesService],
})
export class PrayerTimesModule {}
