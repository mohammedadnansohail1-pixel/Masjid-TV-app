import {
  Controller,
  Get,
  Post,
  Param,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';
import { Request } from 'express';

/**
 * TV Device Controller - Public endpoints for TV player apps
 * These endpoints don't require authentication
 */
@ApiTags('tv-devices')
@Controller('tv-devices')
export class TvDevicesController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a unique 6-digit pairing code
   */
  private async generatePairingCode(): Promise<string> {
    let code: string;
    let isUnique = false;

    while (!isUnique) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await this.prisma.device.findUnique({
        where: { pairingCode: code },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    return code!;
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new TV device (generates pairing code)' })
  @ApiResponse({ status: 201, description: 'Device registered with pairing code' })
  async registerDevice(@Req() req: Request) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;

    const pairingCode = await this.generatePairingCode();

    const device = await this.prisma.device.create({
      data: {
        name: 'Unregistered TV',
        type: 'TV',
        pairingCode,
        isPaired: false,
        userAgent,
        ipAddress,
        activeTemplate: 'template1',
      },
    });

    return {
      device: {
        id: device.id,
        pairingCode: device.pairingCode,
        isPaired: device.isPaired,
        activeTemplate: device.activeTemplate,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get TV device info' })
  @ApiResponse({ status: 200, description: 'Device info retrieved' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async getDevice(@Param('id') id: string) {
    const device = await this.prisma.device.findUnique({
      where: { id },
      include: {
        masjid: true,
      },
    });

    if (!device) {
      return { error: 'Device not found' };
    }

    return {
      id: device.id,
      name: device.name,
      pairingCode: device.pairingCode,
      isPaired: device.isPaired,
      activeTemplate: device.activeTemplate,
      masjid: device.masjid ? {
        id: device.masjid.id,
        name: device.masjid.name,
        timezone: device.masjid.timezone,
      } : null,
    };
  }

  @Get(':id/pairing-status')
  @ApiOperation({ summary: 'Check if TV device is paired' })
  @ApiResponse({ status: 200, description: 'Pairing status retrieved' })
  async checkPairingStatus(@Param('id') id: string) {
    const device = await this.prisma.device.findUnique({
      where: { id },
      include: {
        masjid: true,
      },
    });

    if (!device) {
      return {
        isPaired: false,
        error: 'Device not found',
      };
    }

    return {
      isPaired: device.isPaired,
      masjidId: device.masjidId,
      masjidName: device.masjid?.name || null,
      activeTemplate: device.activeTemplate,
    };
  }

  @Post(':id/heartbeat')
  @ApiOperation({ summary: 'Record TV device heartbeat' })
  @ApiResponse({ status: 200, description: 'Heartbeat recorded' })
  async recordHeartbeat(@Param('id') id: string, @Req() req: Request) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;

    try {
      await this.prisma.device.update({
        where: { id },
        data: {
          lastSeen: new Date(),
          userAgent,
          ipAddress,
        },
      });

      return { success: true };
    } catch {
      return { success: false, error: 'Device not found' };
    }
  }
}
