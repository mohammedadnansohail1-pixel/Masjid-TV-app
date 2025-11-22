import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto';
import { UserRole } from '@prisma/client';
import { DeviceGateway } from '../websocket/websocket.gateway';

@Injectable()
export class SchedulesService {
  constructor(
    private prisma: PrismaService,
    private deviceGateway: DeviceGateway,
  ) {}

  /**
   * Create a new content schedule
   */
  async create(createDto: CreateScheduleDto, user: any) {
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

    const schedule = await this.prisma.contentSchedule.create({
      data: {
        ...createDto,
        startTime: createDto.startTime ? new Date(`1970-01-01T${createDto.startTime}`) : null,
        endTime: createDto.endTime ? new Date(`1970-01-01T${createDto.endTime}`) : null,
      },
    });

    // Broadcast schedule update to TV Players
    this.deviceGateway.broadcastScheduleUpdate(createDto.masjidId, schedule);

    return {
      success: true,
      data: schedule,
    };
  }

  /**
   * Find all schedules for a masjid
   */
  async findAll(masjidId: string, user: any, activeOnly: boolean = false) {
    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== masjidId) {
      throw new ForbiddenException('You do not have access to this masjid');
    }

    const where: any = { masjidId };
    if (activeOnly) {
      where.isActive = true;
    }

    const schedules = await this.prisma.contentSchedule.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return {
      success: true,
      data: schedules,
      meta: {
        total: schedules.length,
      },
    };
  }

  /**
   * Get active content for current time (public endpoint for devices)
   */
  async getActiveContent(masjidId: string) {
    const now = new Date();
    const currentDay = now.getDay(); // 0-6 (Sunday-Saturday)
    const currentTime = now.toTimeString().split(' ')[0]; // HH:mm:ss

    const schedules = await this.prisma.contentSchedule.findMany({
      where: {
        masjidId,
        isActive: true,
        OR: [
          // No time restrictions
          { startTime: null, endTime: null, days: { isEmpty: true } },
          // No time restrictions but day matches
          {
            startTime: null,
            endTime: null,
            days: { has: currentDay },
          },
          // Time restrictions match
          {
            startTime: { lte: new Date(`1970-01-01T${currentTime}`) },
            endTime: { gte: new Date(`1970-01-01T${currentTime}`) },
            days: { isEmpty: true },
          },
          // Time and day restrictions match
          {
            startTime: { lte: new Date(`1970-01-01T${currentTime}`) },
            endTime: { gte: new Date(`1970-01-01T${currentTime}`) },
            days: { has: currentDay },
          },
        ],
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return {
      success: true,
      data: schedules,
      meta: {
        total: schedules.length,
        currentDay,
        currentTime,
      },
    };
  }

  /**
   * Find a specific schedule
   */
  async findOne(id: string, user: any) {
    const schedule = await this.prisma.contentSchedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== schedule.masjidId) {
      throw new ForbiddenException('You do not have access to this schedule');
    }

    return {
      success: true,
      data: schedule,
    };
  }

  /**
   * Update a schedule
   */
  async update(id: string, updateDto: UpdateScheduleDto, user: any) {
    const schedule = await this.prisma.contentSchedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== schedule.masjidId) {
      throw new ForbiddenException('You do not have access to this schedule');
    }

    const updated = await this.prisma.contentSchedule.update({
      where: { id },
      data: {
        ...updateDto,
        startTime: updateDto.startTime ? new Date(`1970-01-01T${updateDto.startTime}`) : undefined,
        endTime: updateDto.endTime ? new Date(`1970-01-01T${updateDto.endTime}`) : undefined,
      },
    });

    // Broadcast schedule update to TV Players
    this.deviceGateway.broadcastScheduleUpdate(schedule.masjidId, updated);

    return {
      success: true,
      data: updated,
    };
  }

  /**
   * Delete a schedule
   */
  async remove(id: string, user: any) {
    const schedule = await this.prisma.contentSchedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== schedule.masjidId) {
      throw new ForbiddenException('You do not have access to this schedule');
    }

    await this.prisma.contentSchedule.delete({
      where: { id },
    });

    // Broadcast schedule update to TV Players
    this.deviceGateway.broadcastScheduleUpdate(schedule.masjidId);

    return {
      success: true,
      message: 'Schedule deleted successfully',
    };
  }
}
