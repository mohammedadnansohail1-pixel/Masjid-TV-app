import { Module } from '@nestjs/common';
import { MasjidsService } from './masjids.service';
import { MasjidsController } from './masjids.controller';

@Module({
  controllers: [MasjidsController],
  providers: [MasjidsService],
  exports: [MasjidsService],
})
export class MasjidsModule {}
