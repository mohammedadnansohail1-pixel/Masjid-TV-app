import { IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceType } from '@prisma/client';

export class CreateDeviceDto {
  @ApiProperty({ example: 'Main Hall TV' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'clx123...' })
  @IsString()
  masjidId: string;

  @ApiPropertyOptional({ enum: DeviceType, example: DeviceType.TV })
  @IsOptional()
  @IsEnum(DeviceType)
  type?: DeviceType;

  @ApiPropertyOptional({ example: 'template1' })
  @IsOptional()
  @IsString()
  activeTemplate?: string;
}
