import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsInt,
  IsArray,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateScheduleDto {
  @ApiProperty({ example: 'Morning Announcements' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'clx123...' })
  @IsString()
  masjidId: string;

  @ApiProperty({ enum: ContentType, example: ContentType.ANNOUNCEMENT })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiPropertyOptional({ example: 'clx456...', description: 'Reference to announcement, media, etc.' })
  @IsOptional()
  @IsString()
  contentId?: string;

  @ApiPropertyOptional({ example: 'https://example.com/page', description: 'For WEBVIEW content type' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ example: '09:00:00', description: 'Time in HH:mm:ss format' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ example: '17:00:00', description: 'Time in HH:mm:ss format' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({
    example: [0, 1, 2, 3, 4, 5, 6],
    description: 'Days of week (0=Sunday, 6=Saturday)',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  @Type(() => Number)
  days?: number[];

  @ApiPropertyOptional({ example: 30, description: 'Display duration in seconds' })
  @IsOptional()
  @IsInt()
  @Min(5)
  duration?: number;

  @ApiPropertyOptional({ example: 10, description: 'Higher priority content shown first' })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
