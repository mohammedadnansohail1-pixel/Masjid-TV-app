import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new donation campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Campaign slug already exists' })
  async create(@Body() createDto: CreateCampaignDto, @CurrentUser() user: any) {
    return this.campaignsService.create(createDto, user);
  }

  @Get('masjid/:masjidId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all campaigns for a masjid' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Param('masjidId') masjidId: string, @CurrentUser() user: any) {
    return this.campaignsService.findAll(masjidId, user);
  }

  @Public()
  @Get('masjid/:masjidId/active')
  @ApiOperation({ summary: 'Get active campaigns for a masjid (public)' })
  @ApiResponse({ status: 200, description: 'Active campaigns retrieved' })
  async findActive(@Param('masjidId') masjidId: string) {
    return this.campaignsService.findActive(masjidId);
  }

  @Public()
  @Get('masjid/:masjidId/slug/:slug')
  @ApiOperation({ summary: 'Get campaign by slug (public)' })
  @ApiResponse({ status: 200, description: 'Campaign retrieved' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async findBySlug(
    @Param('masjidId') masjidId: string,
    @Param('slug') slug: string,
  ) {
    return this.campaignsService.findBySlug(masjidId, slug);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific campaign' })
  @ApiResponse({ status: 200, description: 'Campaign retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.campaignsService.findOne(id, user);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get campaign statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async getStats(@Param('id') id: string, @CurrentUser() user: any) {
    return this.campaignsService.getStats(id, user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a campaign' })
  @ApiResponse({ status: 200, description: 'Campaign updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCampaignDto,
    @CurrentUser() user: any,
  ) {
    return this.campaignsService.update(id, updateDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a campaign' })
  @ApiResponse({ status: 200, description: 'Campaign deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - campaign has donations or access denied' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.campaignsService.remove(id, user);
  }
}
