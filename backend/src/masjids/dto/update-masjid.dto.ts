import { PartialType } from '@nestjs/swagger';
import { CreateMasjidDto } from './create-masjid.dto';

export class UpdateMasjidDto extends PartialType(CreateMasjidDto) {}
