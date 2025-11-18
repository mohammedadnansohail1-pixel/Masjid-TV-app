import { IsString, IsDateString, IsOptional, IsBoolean, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreatePrayerTimeDto {
  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'clx123...' })
  @IsString()
  masjidId: string;

  @ApiProperty({ example: '06:00' })
  @IsString()
  @Matches(timeRegex, { message: 'Time must be in HH:mm format' })
  fajr: string;

  @ApiProperty({ example: '07:15' })
  @IsString()
  @Matches(timeRegex, { message: 'Time must be in HH:mm format' })
  sunrise: string;

  @ApiProperty({ example: '12:30' })
  @IsString()
  @Matches(timeRegex, { message: 'Time must be in HH:mm format' })
  dhuhr: string;

  @ApiProperty({ example: '15:45' })
  @IsString()
  @Matches(timeRegex, { message: 'Time must be in HH:mm format' })
  asr: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  @Matches(timeRegex, { message: 'Time must be in HH:mm format' })
  maghrib: string;

  @ApiProperty({ example: '19:30' })
  @IsString()
  @Matches(timeRegex, { message: 'Time must be in HH:mm format' })
  isha: string;

  @ApiPropertyOptional({ example: '06:15' })
  @IsOptional()
  @IsString()
  @Matches(timeRegex, { message: 'Time must be in HH:mm format' })
  fajrIqamah?: string;

  @ApiPropertyOptional({ example: '12:45' })
  @IsOptional()
  @IsString()
  @Matches(timeRegex, { message: 'Time must be in HH:mm format' })
  dhuhrIqamah?: string;

  @ApiPropertyOptional({ example: '16:00' })
  @IsOptional()
  @IsString()
  @Matches(timeRegex, { message: 'Time must be in HH:mm format' })
  asrIqamah?: string;

  @ApiPropertyOptional({ example: '18:05' })
  @IsOptional()
  @IsString()
  @Matches(timeRegex, { message: 'Time must be in HH:mm format' })
  maghribIqamah?: string;

  @ApiPropertyOptional({ example: '19:45' })
  @IsOptional()
  @IsString()
  @Matches(timeRegex, { message: 'Time must be in HH:mm format' })
  ishaIqamah?: string;

  @ApiPropertyOptional({ example: '13:00' })
  @IsOptional()
  @IsString()
  @Matches(timeRegex, { message: 'Time must be in HH:mm format' })
  jumuah1?: string;

  @ApiPropertyOptional({ example: '14:00' })
  @IsOptional()
  @IsString()
  @Matches(timeRegex, { message: 'Time must be in HH:mm format' })
  jumuah2?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isManual?: boolean;
}
