import { Module } from '@nestjs/common';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { StripeService } from './stripe.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [DonationsController],
  providers: [DonationsService, StripeService],
  exports: [DonationsService],
})
export class DonationsModule {}
