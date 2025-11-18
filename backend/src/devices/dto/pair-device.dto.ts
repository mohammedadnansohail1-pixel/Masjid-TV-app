import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PairDeviceDto {
  @ApiProperty({ example: '123456', description: '6-digit pairing code' })
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'Pairing code must be exactly 6 digits' })
  pairingCode: string;
}
