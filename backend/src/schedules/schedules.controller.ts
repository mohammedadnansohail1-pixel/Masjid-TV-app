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
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto, UpdateScheduleDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN, UserRole.CONTENT_EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new content schedule' })
  @ApiResponse({ status: 201, description: 'Schedule created' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createDto: CreateScheduleDto, @CurrentUser() user: any) {
    return this.schedulesService.create(createDto, user);
  }

  @Get('masjid/:masjidId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all schedules for a masjid' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Schedules retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Param('masjidId') masjidId: string,
    @Query('activeOnly', new ParseBoolPipe({ optional: true })) activeOnly?: boolean,
    @CurrentUser() user?: any,
  ) {
    return this.schedulesService.findAll(masjidId, user, activeOnly);
  }

  @Public()
  @Get('masjid/:masjidId/active')
  @ApiOperation({ summary: 'Get active content for current time (public for devices)' })
  @ApiResponse({ status: 200, description: 'Active content retrieved' })
  async getActiveContent(@Param('masjidId') masjidId: string) {
    return this.schedulesService.getActiveContent(masjidId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific schedule' })
  @ApiResponse({ status: 200, description: 'Schedule retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.schedulesService.findOne(id, user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN, UserRole.CONTENT_EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a schedule' })
  @ApiResponse({ status: 200, description: 'Schedule updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateScheduleDto,
    @CurrentUser() user: any,
  ) {
    return this.schedulesService.update(id, updateDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a schedule' })
  @ApiResponse({ status: 200, description: 'Schedule deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.schedulesService.remove(id, user);
  }
}
