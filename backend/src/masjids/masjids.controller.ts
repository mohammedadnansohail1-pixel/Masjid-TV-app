import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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

@ApiTags('masjids')
@Controller('masjids')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MasjidsController {
  constructor(private readonly masjidsService: MasjidsService) {}

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
