import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';

export class UploadMediaDto {
  @ApiProperty({ example: 'clx123...' })
  @IsString()
  masjidId: string;

  @ApiPropertyOptional({ enum: MediaType, example: MediaType.IMAGE })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;
}
