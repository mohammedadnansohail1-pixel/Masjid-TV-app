import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MasjidsService } from './masjids.service';
import { CreateMasjidDto, UpdateMasjidDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@ApiTags('masjids')
@Controller('masjids')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MasjidsController {
  constructor(
    private readonly masjidsService: MasjidsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new masjid (super admin only)' })
  @ApiResponse({ status: 201, description: 'Masjid created successfully' })
  @ApiResponse({ status: 409, description: 'Masjid with this slug already exists' })
  create(@Body() createMasjidDto: CreateMasjidDto, @CurrentUser() user: any) {
    return this.masjidsService.create(createMasjidDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all masjids (filtered by user role)' })
  @ApiResponse({ status: 200, description: 'Masjids retrieved successfully' })
  findAll(@CurrentUser() user: any) {
    return this.masjidsService.findAll(user);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get masjid by slug (public)' })
  @ApiResponse({ status: 200, description: 'Masjid retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Masjid not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.masjidsService.findBySlug(slug);
  }

  /**
   * Public endpoint for TV players to get today's prayer times
   */
  @Get(':id/prayer-times/today')
  @Public()
  @ApiOperation({ summary: "Get today's prayer times for a masjid (public)" })
  @ApiResponse({ status: 200, description: 'Prayer times retrieved' })
  @ApiResponse({ status: 404, description: 'Prayer times not found' })
  async getPrayerTimesToday(@Param('id') id: string) {
    const masjid = await this.prisma.masjid.findUnique({
      where: { id },
    });

    if (!masjid) {
      throw new NotFoundException('Masjid not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const prayerTime = await this.prisma.prayerTime.findUnique({
      where: {
        masjidId_date: {
          masjidId: id,
          date: today,
        },
      },
    });

    if (!prayerTime) {
      // Return default/empty prayer times if none found
      return {
        masjidId: id,
        masjidName: masjid.name,
        date: today.toISOString().split('T')[0],
        fajr: '05:00',
        sunrise: '06:30',
        dhuhr: '12:30',
        asr: '15:30',
        maghrib: '18:00',
        isha: '19:30',
        // Default iqamah times (not set)
        fajrIqamah: null,
        dhuhrIqamah: null,
        asrIqamah: null,
        maghribIqamah: null,
        ishaIqamah: null,
        jumuah1: null,
        jumuah2: null,
        message: 'Default prayer times - no data configured for today',
      };
    }

    return {
      masjidId: id,
      masjidName: masjid.name,
      date: prayerTime.date,
      fajr: prayerTime.fajr,
      sunrise: prayerTime.sunrise,
      dhuhr: prayerTime.dhuhr,
      asr: prayerTime.asr,
      maghrib: prayerTime.maghrib,
      isha: prayerTime.isha,
      // Iqamah times
      fajrIqamah: prayerTime.fajrIqamah,
      dhuhrIqamah: prayerTime.dhuhrIqamah,
      asrIqamah: prayerTime.asrIqamah,
      maghribIqamah: prayerTime.maghribIqamah,
      ishaIqamah: prayerTime.ishaIqamah,
      // Jummah times
      jumuah1: prayerTime.jumuah1,
      jumuah2: prayerTime.jumuah2,
    };
  }

  /**
   * Public endpoint for TV players to get content schedule
   */
  @Get(':id/content-schedule')
  @Public()
  @ApiOperation({ summary: 'Get content schedule for a masjid (public)' })
  @ApiResponse({ status: 200, description: 'Content schedule retrieved' })
  @ApiResponse({ status: 404, description: 'Masjid not found' })
  async getContentSchedule(@Param('id') id: string) {
    const masjid = await this.prisma.masjid.findUnique({
      where: { id },
    });

    if (!masjid) {
      throw new NotFoundException('Masjid not found');
    }

    // Get today's prayer times
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const prayerTime = await this.prisma.prayerTime.findUnique({
      where: {
        masjidId_date: {
          masjidId: id,
          date: today,
        },
      },
    });

    // Get active announcements
    const now = new Date();
    const announcements = await this.prisma.announcement.findMany({
      where: {
        masjidId: id,
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
      },
      orderBy: { priority: 'desc' },
    });

    // Filter announcements that haven't ended yet
    const activeAnnouncements = announcements.filter(a =>
      !a.endDate || a.endDate >= now
    );

    // Get media items for this masjid
    const mediaItems = await this.prisma.media.findMany({
      where: {
        masjidId: id,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get content schedule for active content
    const contentSchedules = await this.prisma.contentSchedule.findMany({
      where: {
        masjidId: id,
        isActive: true,
      },
      orderBy: { priority: 'desc' },
    });

    // Get device template (default to masjid's default template)
    const device = await this.prisma.device.findFirst({
      where: { masjidId: id },
    });

    return {
      masjidName: masjid.name,
      masjidLogo: masjid.logo || null,
      currentTemplate: device?.activeTemplate || masjid.defaultTemplate || 'template1',
      prayerTimes: prayerTime ? {
        fajr: prayerTime.fajr,
        sunrise: prayerTime.sunrise,
        dhuhr: prayerTime.dhuhr,
        asr: prayerTime.asr,
        maghrib: prayerTime.maghrib,
        isha: prayerTime.isha,
        date: prayerTime.date,
        // Iqamah times
        fajrIqamah: prayerTime.fajrIqamah,
        dhuhrIqamah: prayerTime.dhuhrIqamah,
        asrIqamah: prayerTime.asrIqamah,
        maghribIqamah: prayerTime.maghribIqamah,
        ishaIqamah: prayerTime.ishaIqamah,
        // Jummah times
        jumuah1: prayerTime.jumuah1,
        jumuah2: prayerTime.jumuah2,
      } : {
        fajr: '05:00',
        sunrise: '06:30',
        dhuhr: '12:30',
        asr: '15:30',
        maghrib: '18:00',
        isha: '19:30',
        fajrIqamah: null,
        dhuhrIqamah: null,
        asrIqamah: null,
        maghribIqamah: null,
        ishaIqamah: null,
        jumuah1: null,
        jumuah2: null,
      },
      announcements: activeAnnouncements.map(a => ({
        id: a.id,
        title: a.title,
        content: a.body, // body is the content field in schema
        imageUrl: a.imageUrl,
        startDate: a.startDate,
        endDate: a.endDate,
        isActive: a.isActive,
        priority: a.priority,
      })),
      media: mediaItems.map(m => ({
        id: m.id,
        type: m.type.toLowerCase(),
        url: m.url,
        title: m.originalName,
        isActive: true,
      })),
      contentSchedule: contentSchedules.map(cs => ({
        id: cs.id,
        name: cs.name,
        contentType: cs.contentType,
        contentId: cs.contentId,
        url: cs.url,
        duration: cs.duration,
        priority: cs.priority,
        isActive: cs.isActive,
      })),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get masjid by ID' })
  @ApiResponse({ status: 200, description: 'Masjid retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Masjid not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.masjidsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update masjid' })
  @ApiResponse({ status: 200, description: 'Masjid updated successfully' })
  @ApiResponse({ status: 404, description: 'Masjid not found' })
  update(
    @Param('id') id: string,
    @Body() updateMasjidDto: UpdateMasjidDto,
    @CurrentUser() user: any,
  ) {
    return this.masjidsService.update(id, updateMasjidDto, user);
  }

  @Patch(':id/settings')
  @ApiOperation({ summary: 'Update prayer calculation settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  updateSettings(
    @Param('id') id: string,
    @Body() settings: any,
    @CurrentUser() user: any,
  ) {
    return this.masjidsService.updateCalculationSettings(id, settings, user);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete masjid (super admin only)' })
  @ApiResponse({ status: 200, description: 'Masjid deleted successfully' })
  @ApiResponse({ status: 404, description: 'Masjid not found' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.masjidsService.remove(id, user);
  }
}
