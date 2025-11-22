import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto';
import { UserRole } from '@prisma/client';
import { DeviceGateway } from '../websocket/websocket.gateway';

@Injectable()
export class AnnouncementsService {
  constructor(
    private prisma: PrismaService,
    private deviceGateway: DeviceGateway,
  ) {}

  /**
   * Create a new announcement
   */
  async create(createDto: CreateAnnouncementDto, user: any) {
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

    const announcement = await this.prisma.announcement.create({
      data: {
        ...createDto,
        startDate: createDto.startDate ? new Date(createDto.startDate) : null,
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
        createdBy: user.id,
      },
    });

    // Broadcast announcement update to TV players
    this.deviceGateway.broadcastAnnouncementUpdate(createDto.masjidId, announcement);

    return {
      success: true,
      data: announcement,
    };
  }

  /**
   * Find all announcements for a masjid
   */
  async findAll(masjidId: string, user: any, activeOnly: boolean = false) {
    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== masjidId) {
      throw new ForbiddenException('You do not have access to this masjid');
    }

    const where: any = { masjidId };

    if (activeOnly) {
      const now = new Date();
      where.isActive = true;
      where.OR = [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: { gte: now } },
      ];
    }

    const announcements = await this.prisma.announcement.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return {
      success: true,
      data: announcements,
      meta: {
        total: announcements.length,
      },
    };
  }

  /**
   * Get active announcements (public endpoint)
   */
  async findActive(masjidId: string) {
    const now = new Date();

    const announcements = await this.prisma.announcement.findMany({
      where: {
        masjidId,
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return {
      success: true,
      data: announcements,
      meta: {
        total: announcements.length,
      },
    };
  }

  /**
   * Find a specific announcement
   */
  async findOne(id: string, user: any) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: {
        masjid: true,
      },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== announcement.masjidId) {
      throw new ForbiddenException('You do not have access to this announcement');
    }

    return {
      success: true,
      data: announcement,
    };
  }

  /**
   * Update an announcement
   */
  async update(id: string, updateDto: UpdateAnnouncementDto, user: any) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== announcement.masjidId) {
      throw new ForbiddenException('You do not have access to this announcement');
    }

    const updated = await this.prisma.announcement.update({
      where: { id },
      data: {
        ...updateDto,
        startDate: updateDto.startDate ? new Date(updateDto.startDate) : undefined,
        endDate: updateDto.endDate ? new Date(updateDto.endDate) : undefined,
      },
    });

    // Broadcast announcement update to TV players
    this.deviceGateway.broadcastAnnouncementUpdate(announcement.masjidId, updated);

    return {
      success: true,
      data: updated,
    };
  }

  /**
   * Delete an announcement
   */
  async remove(id: string, user: any) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== announcement.masjidId) {
      throw new ForbiddenException('You do not have access to this announcement');
    }

    await this.prisma.announcement.delete({
      where: { id },
    });

    // Broadcast announcement update to TV players
    this.deviceGateway.broadcastAnnouncementUpdate(announcement.masjidId);

    return {
      success: true,
      message: 'Announcement deleted successfully',
    };
  }
}
