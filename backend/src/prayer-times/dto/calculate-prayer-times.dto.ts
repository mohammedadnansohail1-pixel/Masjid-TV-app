import { IsString, IsInt, Min, Max, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CalculatePrayerTimesDto {
  @ApiProperty({ example: 'clx123...' })
  @IsString()
  masjidId: string;

  @ApiProperty({ example: '2024-01-01', description: 'Start date (YYYY-MM-DD)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-12-31', description: 'End date (YYYY-MM-DD), max 1 year + 1 day from start' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    example: false,
    description: 'If true, will overwrite existing prayer times'
  })
  @IsOptional()
  overwrite?: boolean;
}
