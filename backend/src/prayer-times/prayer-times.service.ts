import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AladhanApiService } from './aladhan-api.service';
import { CreatePrayerTimeDto, UpdatePrayerTimeDto, CalculatePrayerTimesDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class PrayerTimesService {
  constructor(
    private prisma: PrismaService,
    private aladhanApi: AladhanApiService,
  ) {}

  /**
   * Create a manual prayer time entry
   */
  async create(createDto: CreatePrayerTimeDto, user: any) {
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

    // Check if prayer time already exists for this date
    const existing = await this.prisma.prayerTime.findUnique({
      where: {
        masjidId_date: {
          masjidId: createDto.masjidId,
          date: new Date(createDto.date),
        },
      },
    });

    if (existing) {
      throw new ConflictException('Prayer time already exists for this date');
    }

    const prayerTime = await this.prisma.prayerTime.create({
      data: {
        ...createDto,
        date: new Date(createDto.date),
        isManual: createDto.isManual ?? true,
      },
    });

    return {
      success: true,
      data: prayerTime,
    };
  }

  /**
   * Find all prayer times for a masjid (with date range filtering)
   */
  async findAll(
    masjidId: string,
    user: any,
    startDate?: string,
    endDate?: string,
  ) {
    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== masjidId) {
      throw new ForbiddenException('You do not have access to this masjid');
    }

    const where: any = { masjidId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const prayerTimes = await this.prisma.prayerTime.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return {
      success: true,
      data: prayerTimes,
      meta: {
        total: prayerTimes.length,
      },
    };
  }

  /**
   * Get prayer times for a specific date (public endpoint)
   */
  async findByDate(masjidId: string, date: string) {
    const prayerTime = await this.prisma.prayerTime.findUnique({
      where: {
        masjidId_date: {
          masjidId,
          date: new Date(date),
        },
      },
    });

    if (!prayerTime) {
      throw new NotFoundException('Prayer times not found for this date');
    }

    return {
      success: true,
      data: prayerTime,
    };
  }

  /**
   * Get today's prayer times (public endpoint)
   */
  async findToday(masjidId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const prayerTime = await this.prisma.prayerTime.findUnique({
      where: {
        masjidId_date: {
          masjidId,
          date: today,
        },
      },
    });

    if (!prayerTime) {
      throw new NotFoundException('Prayer times not found for today');
    }

    return {
      success: true,
      data: prayerTime,
    };
  }

  /**
   * Get current month's prayer times (public endpoint)
   */
  async findCurrentMonth(masjidId: string) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const prayerTimes = await this.prisma.prayerTime.findMany({
      where: {
        masjidId,
        date: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      orderBy: { date: 'asc' },
    });

    return {
      success: true,
      data: prayerTimes,
      meta: {
        total: prayerTimes.length,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      },
    };
  }

  /**
   * Update a prayer time entry
   */
  async update(masjidId: string, date: string, updateDto: UpdatePrayerTimeDto, user: any) {
    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== masjidId) {
      throw new ForbiddenException('You do not have access to this masjid');
    }

    const prayerTime = await this.prisma.prayerTime.findUnique({
      where: {
        masjidId_date: {
          masjidId,
          date: new Date(date),
        },
      },
    });

    if (!prayerTime) {
      throw new NotFoundException('Prayer time not found');
    }

    const updated = await this.prisma.prayerTime.update({
      where: {
        masjidId_date: {
          masjidId,
          date: new Date(date),
        },
      },
      data: {
        ...updateDto,
        isManual: true, // Any manual update marks it as manual
      },
    });

    return {
      success: true,
      data: updated,
    };
  }

  /**
   * Delete a prayer time entry
   */
  async remove(masjidId: string, date: string, user: any) {
    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== masjidId) {
      throw new ForbiddenException('You do not have access to this masjid');
    }

    const prayerTime = await this.prisma.prayerTime.findUnique({
      where: {
        masjidId_date: {
          masjidId,
          date: new Date(date),
        },
      },
    });

    if (!prayerTime) {
      throw new NotFoundException('Prayer time not found');
    }

    await this.prisma.prayerTime.delete({
      where: {
        masjidId_date: {
          masjidId,
          date: new Date(date),
        },
      },
    });

    return {
      success: true,
      message: 'Prayer time deleted successfully',
    };
  }

  /**
   * Calculate and save prayer times for a date range using Aladhan API
   * Maximum range: 1 year + 1 day (366 days)
   */
  async calculateMonthlyPrayerTimes(calculateDto: CalculatePrayerTimesDto, user: any) {
    const { masjidId, startDate, endDate, overwrite } = calculateDto;

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== masjidId) {
      throw new ForbiddenException('You do not have access to this masjid');
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Validate date range
    if (end < start) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check maximum range (1 year + 1 day = 366 days)
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 366) {
      throw new BadRequestException('Date range cannot exceed 1 year + 1 day (366 days)');
    }

    // Get masjid with location data
    const masjid = await this.prisma.masjid.findUnique({
      where: { id: masjidId },
    });

    if (!masjid) {
      throw new NotFoundException('Masjid not found');
    }

    if (!masjid.latitude || !masjid.longitude) {
      throw new BadRequestException(
        'Masjid must have latitude and longitude set to calculate prayer times',
      );
    }

    // Get all months in the range
    const months: { year: number; month: number }[] = [];
    const current = new Date(start);
    while (current <= end) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1;
      if (!months.some(m => m.year === year && m.month === month)) {
        months.push({ year, month });
      }
      current.setMonth(current.getMonth() + 1);
    }

    // Fetch prayer times from Aladhan API for each month
    const allTimes: any[] = [];
    for (const { year, month } of months) {
      const monthlyTimes = await this.aladhanApi.getPrayerTimesForMonth(
        year,
        month,
        masjid.latitude,
        masjid.longitude,
        masjid.calculationMethod,
        masjid.asrCalculation,
        masjid.highLatitudeRule,
      );
      allTimes.push(...monthlyTimes);
    }

    // Filter to only include dates within the specified range
    const filteredTimes = allTimes.filter(dayTime => {
      const date = new Date(dayTime.date);
      date.setHours(0, 0, 0, 0);
      return date >= start && date <= end;
    });

    // Prepare prayer times for bulk insert
    const created: any[] = [];
    const skipped: any[] = [];
    const updated: any[] = [];

    for (const dayTime of filteredTimes) {
      const date = new Date(dayTime.date);

      // Check if already exists
      const existing = await this.prisma.prayerTime.findUnique({
        where: {
          masjidId_date: {
            masjidId,
            date,
          },
        },
      });

      if (existing) {
        if (overwrite) {
          // Update existing (preserve Iqamah times)
          const updatedTime = await this.prisma.prayerTime.update({
            where: {
              masjidId_date: {
                masjidId,
                date,
              },
            },
            data: {
              fajr: dayTime.fajr,
              sunrise: dayTime.sunrise,
              dhuhr: dayTime.dhuhr,
              asr: dayTime.asr,
              maghrib: dayTime.maghrib,
              isha: dayTime.isha,
              isManual: false,
            },
          });
          updated.push(updatedTime);
        } else {
          skipped.push({ date: dayTime.date, reason: 'already exists' });
        }
      } else {
        // Create new
        const newTime = await this.prisma.prayerTime.create({
          data: {
            masjidId,
            date,
            fajr: dayTime.fajr,
            sunrise: dayTime.sunrise,
            dhuhr: dayTime.dhuhr,
            asr: dayTime.asr,
            maghrib: dayTime.maghrib,
            isha: dayTime.isha,
            isManual: false,
          },
        });
        created.push(newTime);
      }
    }

    return {
      success: true,
      data: {
        created: created.length,
        updated: updated.length,
        skipped: skipped.length,
      },
      meta: {
        startDate,
        endDate,
        totalDays: filteredTimes.length,
        createdRecords: created,
        updatedRecords: updated,
        skippedRecords: skipped,
      },
    };
  }

  /**
   * Bulk update Iqamah times for all future dates (from today onwards)
   */
  async bulkUpdateIqamah(masjidId: string, updateDto: UpdatePrayerTimeDto, user: any) {
    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== masjidId) {
      throw new ForbiddenException('You do not have access to this masjid');
    }

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build update data - only include Iqamah fields that are provided
    const updateData: any = {};
    if (updateDto.fajrIqamah !== undefined) updateData.fajrIqamah = updateDto.fajrIqamah;
    if (updateDto.dhuhrIqamah !== undefined) updateData.dhuhrIqamah = updateDto.dhuhrIqamah;
    if (updateDto.asrIqamah !== undefined) updateData.asrIqamah = updateDto.asrIqamah;
    if (updateDto.maghribIqamah !== undefined) updateData.maghribIqamah = updateDto.maghribIqamah;
    if (updateDto.ishaIqamah !== undefined) updateData.ishaIqamah = updateDto.ishaIqamah;
    if (updateDto.jumuah1 !== undefined) updateData.jumuah1 = updateDto.jumuah1;
    if (updateDto.jumuah2 !== undefined) updateData.jumuah2 = updateDto.jumuah2;

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No Iqamah times provided to update');
    }

    // Update all prayer times from today onwards
    const result = await this.prisma.prayerTime.updateMany({
      where: {
        masjidId,
        date: {
          gte: today,
        },
      },
      data: updateData,
    });

    return {
      success: true,
      data: {
        updatedCount: result.count,
      },
      message: `Successfully updated Iqamah times for ${result.count} dates`,
    };
  }

  /**
   * Bulk upload prayer times (for CSV import, etc.)
   */
  async bulkUpload(prayerTimes: CreatePrayerTimeDto[], user: any) {
    if (!prayerTimes || prayerTimes.length === 0) {
      throw new BadRequestException('No prayer times provided');
    }

    // Check authorization for all masjids
    const masjidIds = [...new Set(prayerTimes.map(pt => pt.masjidId))];

    for (const masjidId of masjidIds) {
      if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== masjidId) {
        throw new ForbiddenException(`You do not have access to masjid: ${masjidId}`);
      }
    }

    const created: any[] = [];
    const failed: any[] = [];

    for (const prayerTimeDto of prayerTimes) {
      try {
        const existing = await this.prisma.prayerTime.findUnique({
          where: {
            masjidId_date: {
              masjidId: prayerTimeDto.masjidId,
              date: new Date(prayerTimeDto.date),
            },
          },
        });

        if (existing) {
          failed.push({
            data: prayerTimeDto,
            reason: 'already exists',
          });
        } else {
          const newTime = await this.prisma.prayerTime.create({
            data: {
              ...prayerTimeDto,
              date: new Date(prayerTimeDto.date),
              isManual: prayerTimeDto.isManual ?? true,
            },
          });
          created.push(newTime);
        }
      } catch (error) {
        failed.push({
          data: prayerTimeDto,
          reason: error.message,
        });
      }
    }

    return {
      success: true,
      data: {
        created: created.length,
        failed: failed.length,
      },
      meta: {
        createdRecords: created,
        failedRecords: failed,
      },
    };
  }
}
