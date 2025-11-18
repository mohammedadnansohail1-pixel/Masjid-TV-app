import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateDeviceDto, UpdateDeviceDto, PairDeviceDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a unique 6-digit pairing code
   */
  private async generatePairingCode(): Promise<string> {
    let code: string;
    let isUnique = false;

    while (!isUnique) {
      // Generate a random 6-digit number
      code = Math.floor(100000 + Math.random() * 900000).toString();

      // Check if this code is already in use
      const existing = await this.prisma.device.findUnique({
        where: { pairingCode: code },
      });

      if (!existing) {
        isUnique = true;
      }
    }

    return code;
  }

  /**
   * Create a new device (generates pairing code)
   */
  async create(createDto: CreateDeviceDto, user: any) {
    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== createDto.masjidId) {
      throw new ForbiddenException('You do not have access to this masjid');
    }

    // Verify masjid exists
    const masjid = await this.prisma.masjid.findUnique({
      where: { id: createDto.masjidId },
    });

    if (!masjid) {
      throw new NotFoundException('Masjid not found');
    }

    // Generate unique pairing code
    const pairingCode = await this.generatePairingCode();

    const device = await this.prisma.device.create({
      data: {
        ...createDto,
        pairingCode,
        isPaired: false,
      },
    });

    return {
      success: true,
      data: device,
    };
  }

  /**
   * Find all devices for a masjid
   */
  async findAll(masjidId: string, user: any) {
    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== masjidId) {
      throw new ForbiddenException('You do not have access to this masjid');
    }

    const devices = await this.prisma.device.findMany({
      where: { masjidId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: devices,
      meta: {
        total: devices.length,
      },
    };
  }

  /**
   * Find a specific device
   */
  async findOne(id: string, user: any) {
    const device = await this.prisma.device.findUnique({
      where: { id },
      include: {
        masjid: true,
      },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== device.masjidId) {
      throw new ForbiddenException('You do not have access to this device');
    }

    return {
      success: true,
      data: device,
    };
  }

  /**
   * Update a device
   */
  async update(id: string, updateDto: UpdateDeviceDto, user: any) {
    const device = await this.prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== device.masjidId) {
      throw new ForbiddenException('You do not have access to this device');
    }

    const updated = await this.prisma.device.update({
      where: { id },
      data: updateDto,
    });

    return {
      success: true,
      data: updated,
    };
  }

  /**
   * Delete a device
   */
  async remove(id: string, user: any) {
    const device = await this.prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== device.masjidId) {
      throw new ForbiddenException('You do not have access to this device');
    }

    await this.prisma.device.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Device deleted successfully',
    };
  }

  /**
   * Pair a device using pairing code (public endpoint for device apps)
   */
  async pairDevice(pairDto: PairDeviceDto, userAgent?: string, ipAddress?: string) {
    const device = await this.prisma.device.findUnique({
      where: { pairingCode: pairDto.pairingCode },
      include: {
        masjid: true,
      },
    });

    if (!device) {
      throw new NotFoundException('Invalid pairing code');
    }

    if (device.isPaired) {
      throw new ConflictException('Device is already paired');
    }

    // Update device with pairing info
    const paired = await this.prisma.device.update({
      where: { id: device.id },
      data: {
        isPaired: true,
        userAgent,
        ipAddress,
        lastSeen: new Date(),
      },
      include: {
        masjid: true,
      },
    });

    return {
      success: true,
      data: paired,
      message: 'Device paired successfully',
    };
  }

  /**
   * Unpair a device (reset for re-pairing)
   */
  async unpairDevice(id: string, user: any) {
    const device = await this.prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== device.masjidId) {
      throw new ForbiddenException('You do not have access to this device');
    }

    // Generate new pairing code and unpair
    const newPairingCode = await this.generatePairingCode();

    const updated = await this.prisma.device.update({
      where: { id },
      data: {
        isPaired: false,
        pairingCode: newPairingCode,
        userAgent: null,
        ipAddress: null,
      },
    });

    return {
      success: true,
      data: updated,
      message: 'Device unpaired successfully. New pairing code generated.',
    };
  }

  /**
   * Record device heartbeat (public endpoint for device apps)
   */
  async heartbeat(pairingCode: string) {
    const device = await this.prisma.device.findUnique({
      where: { pairingCode },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (!device.isPaired) {
      throw new BadRequestException('Device is not paired');
    }

    await this.prisma.device.update({
      where: { id: device.id },
      data: {
        lastSeen: new Date(),
      },
    });

    return {
      success: true,
      message: 'Heartbeat recorded',
    };
  }

  /**
   * Get device by pairing code (for device apps to fetch their config)
   */
  async getByPairingCode(pairingCode: string) {
    const device = await this.prisma.device.findUnique({
      where: { pairingCode },
      include: {
        masjid: true,
      },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (!device.isPaired) {
      throw new BadRequestException('Device is not paired yet');
    }

    return {
      success: true,
      data: device,
    };
  }
}
