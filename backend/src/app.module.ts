import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Database
import { DatabaseModule } from './database/database.module';

// Auth
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards';

// Feature Modules
import { MasjidsModule } from './masjids/masjids.module';
import { PrayerTimesModule } from './prayer-times/prayer-times.module';
import { DevicesModule } from './devices/devices.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { MediaModule } from './media/media.module';
import { SchedulesModule } from './schedules/schedules.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { DonationsModule } from './donations/donations.module';
import { WebSocketModule } from './websocket/websocket.module';

// Common
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// Config
import configuration from './config/configuration';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Database
    DatabaseModule,

    // Authentication
    AuthModule,

    // Feature Modules
    MasjidsModule,
    PrayerTimesModule,
    DevicesModule,
    AnnouncementsModule,
    MediaModule,
    SchedulesModule,
    CampaignsModule,
    DonationsModule,
    WebSocketModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
