import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateDeviceDto } from './create-device.dto';
import { IsBoolean, IsInt, Min, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDeviceDto extends PartialType(
  OmitType(CreateDeviceDto, ['masjidId'] as const),
) {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 30, description: 'Content rotation interval in seconds' })
  @IsOptional()
  @IsInt()
  @Min(5)
  contentRotationInterval?: number;
}
