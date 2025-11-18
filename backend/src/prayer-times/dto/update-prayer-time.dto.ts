import { PartialType } from '@nestjs/swagger';
import { CreatePrayerTimeDto } from './create-prayer-time.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdatePrayerTimeDto extends PartialType(
  OmitType(CreatePrayerTimeDto, ['masjidId', 'date'] as const),
) {}
