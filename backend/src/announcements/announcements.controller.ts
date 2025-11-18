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
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN, UserRole.CONTENT_EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new announcement' })
  @ApiResponse({ status: 201, description: 'Announcement created' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createDto: CreateAnnouncementDto, @CurrentUser() user: any) {
    return this.announcementsService.create(createDto, user);
  }

  @Get('masjid/:masjidId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all announcements for a masjid' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Announcements retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Param('masjidId') masjidId: string,
    @Query('activeOnly', new ParseBoolPipe({ optional: true })) activeOnly?: boolean,
    @CurrentUser() user?: any,
  ) {
    return this.announcementsService.findAll(masjidId, user, activeOnly);
  }

  @Public()
  @Get('masjid/:masjidId/active')
  @ApiOperation({ summary: 'Get active announcements for a masjid (public)' })
  @ApiResponse({ status: 200, description: 'Active announcements retrieved' })
  async findActive(@Param('masjidId') masjidId: string) {
    return this.announcementsService.findActive(masjidId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific announcement' })
  @ApiResponse({ status: 200, description: 'Announcement retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.announcementsService.findOne(id, user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN, UserRole.CONTENT_EDITOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an announcement' })
  @ApiResponse({ status: 200, description: 'Announcement updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAnnouncementDto,
    @CurrentUser() user: any,
  ) {
    return this.announcementsService.update(id, updateDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an announcement' })
  @ApiResponse({ status: 200, description: 'Announcement deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.announcementsService.remove(id, user);
  }
}
