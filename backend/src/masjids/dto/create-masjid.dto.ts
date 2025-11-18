import { IsString, IsOptional, IsNumber, IsEnum, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PrayerCalculationMethod, AsrCalculation, HighLatitudeRule } from '@prisma/client';

export class CreateMasjidDto {
  @ApiProperty({ example: 'Masjid Al-Rahman' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'masjid-al-rahman' })
  @IsString()
  @MinLength(3)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @ApiPropertyOptional({ example: '123 Main Street' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'New York' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'NY' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '10001' })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional({ example: 'USA' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 40.7128 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -74.0060 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: 'America/New_York' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: 'info@masjid.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '+1-555-0123' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://masjid.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ enum: PrayerCalculationMethod, example: PrayerCalculationMethod.ISNA })
  @IsOptional()
  @IsEnum(PrayerCalculationMethod)
  calculationMethod?: PrayerCalculationMethod;

  @ApiPropertyOptional({ enum: AsrCalculation, example: AsrCalculation.STANDARD })
  @IsOptional()
  @IsEnum(AsrCalculation)
  asrCalculation?: AsrCalculation;

  @ApiPropertyOptional({ enum: HighLatitudeRule, example: HighLatitudeRule.MIDDLE_OF_NIGHT })
  @IsOptional()
  @IsEnum(HighLatitudeRule)
  highLatitudeRule?: HighLatitudeRule;

  @ApiPropertyOptional({ example: 'template1' })
  @IsOptional()
  @IsString()
  defaultTemplate?: string;
}
