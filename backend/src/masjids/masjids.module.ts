import { Module } from '@nestjs/common';
import { MasjidsService } from './masjids.service';
import { MasjidsController } from './masjids.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MasjidsController],
  providers: [MasjidsService],
  exports: [MasjidsService],
})
export class MasjidsModule {}
