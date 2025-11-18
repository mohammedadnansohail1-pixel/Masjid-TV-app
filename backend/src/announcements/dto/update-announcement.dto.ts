import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateAnnouncementDto } from './create-announcement.dto';

export class UpdateAnnouncementDto extends PartialType(
  OmitType(CreateAnnouncementDto, ['masjidId'] as const),
) {}
