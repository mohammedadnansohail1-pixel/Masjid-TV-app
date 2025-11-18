import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CalculatePrayerTimesDto {
  @ApiProperty({ example: 'clx123...' })
  @IsString()
  masjidId: string;

  @ApiProperty({ example: 2024 })
  @IsInt()
  @Min(2020)
  @Max(2100)
  @Type(() => Number)
  year: number;

  @ApiProperty({ example: 1, description: 'Month (1-12)' })
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month: number;

  @ApiPropertyOptional({
    example: false,
    description: 'If true, will overwrite existing prayer times'
  })
  @IsOptional()
  overwrite?: boolean;
}
