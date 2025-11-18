import { IsString, IsOptional, IsBoolean, IsDateString, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Important Community Meeting' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Join us for an important community meeting this Friday after Maghrib prayer.' })
  @IsString()
  body: string;

  @ApiProperty({ example: 'clx123...' })
  @IsString()
  masjidId: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-01-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 10, description: 'Higher priority announcements shown first' })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;
}
