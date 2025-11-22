import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PrayerTimesService } from './prayer-times.service';
import { CreatePrayerTimeDto, UpdatePrayerTimeDto, CalculatePrayerTimesDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('prayer-times')
@Controller('prayer-times')
export class PrayerTimesController {
  constructor(private readonly prayerTimesService: PrayerTimesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a manual prayer time entry' })
  @ApiResponse({ status: 201, description: 'Prayer time created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Prayer time already exists for this date' })
  async create(@Body() createDto: CreatePrayerTimeDto, @CurrentUser() user: any) {
    return this.prayerTimesService.create(createDto, user);
  }

  @Post('calculate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calculate and save prayer times for a month using Aladhan API' })
  @ApiResponse({ status: 201, description: 'Prayer times calculated and saved' })
  @ApiResponse({ status: 400, description: 'Bad request - missing location data' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async calculateMonthly(
    @Body() calculateDto: CalculatePrayerTimesDto,
    @CurrentUser() user: any,
  ) {
    return this.prayerTimesService.calculateMonthlyPrayerTimes(calculateDto, user);
  }

  @Post('bulk-upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk upload prayer times (CSV import)' })
  @ApiResponse({ status: 201, description: 'Prayer times uploaded' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async bulkUpload(
    @Body() prayerTimes: CreatePrayerTimeDto[],
    @CurrentUser() user: any,
  ) {
    return this.prayerTimesService.bulkUpload(prayerTimes, user);
  }

  @Get('masjid/:masjidId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all prayer times for a masjid' })
  @ApiQuery({ name: 'startDate', required: false, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2024-01-31' })
  @ApiResponse({ status: 200, description: 'Prayer times retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Param('masjidId') masjidId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @CurrentUser() user?: any,
  ) {
    return this.prayerTimesService.findAll(masjidId, user, startDate, endDate);
  }

  @Public()
  @Get('masjid/:masjidId/date/:date')
  @ApiOperation({ summary: 'Get prayer times for a specific date (public)' })
  @ApiResponse({ status: 200, description: 'Prayer times retrieved' })
  @ApiResponse({ status: 404, description: 'Prayer times not found' })
  async findByDate(
    @Param('masjidId') masjidId: string,
    @Param('date') date: string,
  ) {
    return this.prayerTimesService.findByDate(masjidId, date);
  }

  @Public()
  @Get('masjid/:masjidId/today')
  @ApiOperation({ summary: 'Get today\'s prayer times (public)' })
  @ApiResponse({ status: 200, description: 'Prayer times retrieved' })
  @ApiResponse({ status: 404, description: 'Prayer times not found' })
  async findToday(@Param('masjidId') masjidId: string) {
    return this.prayerTimesService.findToday(masjidId);
  }

  @Public()
  @Get('masjid/:masjidId/current-month')
  @ApiOperation({ summary: 'Get current month\'s prayer times (public)' })
  @ApiResponse({ status: 200, description: 'Prayer times retrieved' })
  async findCurrentMonth(@Param('masjidId') masjidId: string) {
    return this.prayerTimesService.findCurrentMonth(masjidId);
  }

  @Put('masjid/:masjidId/date/:date')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update prayer times for a specific date' })
  @ApiResponse({ status: 200, description: 'Prayer time updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Prayer time not found' })
  async update(
    @Param('masjidId') masjidId: string,
    @Param('date') date: string,
    @Body() updateDto: UpdatePrayerTimeDto,
    @CurrentUser() user: any,
  ) {
    return this.prayerTimesService.update(masjidId, date, updateDto, user);
  }

  @Delete('masjid/:masjidId/date/:date')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete prayer time for a specific date' })
  @ApiResponse({ status: 200, description: 'Prayer time deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Prayer time not found' })
  async remove(
    @Param('masjidId') masjidId: string,
    @Param('date') date: string,
    @CurrentUser() user: any,
  ) {
    return this.prayerTimesService.remove(masjidId, date, user);
  }

  @Put('masjid/:masjidId/bulk-iqamah')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update Iqamah times for all future dates' })
  @ApiResponse({ status: 200, description: 'Iqamah times updated for all future dates' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async bulkUpdateIqamah(
    @Param('masjidId') masjidId: string,
    @Body() updateDto: UpdatePrayerTimeDto,
    @CurrentUser() user: any,
  ) {
    return this.prayerTimesService.bulkUpdateIqamah(masjidId, updateDto, user);
  }
}
