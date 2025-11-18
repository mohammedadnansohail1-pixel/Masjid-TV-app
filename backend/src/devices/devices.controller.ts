import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DevicesService } from './devices.service';
import { CreateDeviceDto, UpdateDeviceDto, PairDeviceDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Request } from 'express';

@ApiTags('devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new device and generate pairing code' })
  @ApiResponse({ status: 201, description: 'Device created with pairing code' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createDto: CreateDeviceDto, @CurrentUser() user: any) {
    return this.devicesService.create(createDto, user);
  }

  @Get('masjid/:masjidId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all devices for a masjid' })
  @ApiResponse({ status: 200, description: 'Devices retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Param('masjidId') masjidId: string, @CurrentUser() user: any) {
    return this.devicesService.findAll(masjidId, user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific device' })
  @ApiResponse({ status: 200, description: 'Device retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.devicesService.findOne(id, user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a device' })
  @ApiResponse({ status: 200, description: 'Device updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDeviceDto,
    @CurrentUser() user: any,
  ) {
    return this.devicesService.update(id, updateDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a device' })
  @ApiResponse({ status: 200, description: 'Device deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.devicesService.remove(id, user);
  }

  @Public()
  @Post('pair')
  @ApiOperation({ summary: 'Pair a device using pairing code (public for device apps)' })
  @ApiResponse({ status: 200, description: 'Device paired successfully' })
  @ApiResponse({ status: 404, description: 'Invalid pairing code' })
  @ApiResponse({ status: 409, description: 'Device already paired' })
  async pair(@Body() pairDto: PairDeviceDto, @Req() req: Request) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.devicesService.pairDevice(pairDto, userAgent, ipAddress);
  }

  @Post(':id/unpair')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpair a device and generate new pairing code' })
  @ApiResponse({ status: 200, description: 'Device unpaired' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async unpair(@Param('id') id: string, @CurrentUser() user: any) {
    return this.devicesService.unpairDevice(id, user);
  }

  @Public()
  @Post('heartbeat/:pairingCode')
  @ApiOperation({ summary: 'Record device heartbeat (public for device apps)' })
  @ApiResponse({ status: 200, description: 'Heartbeat recorded' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async heartbeat(@Param('pairingCode') pairingCode: string) {
    return this.devicesService.heartbeat(pairingCode);
  }

  @Public()
  @Get('config/:pairingCode')
  @ApiOperation({ summary: 'Get device config by pairing code (public for device apps)' })
  @ApiResponse({ status: 200, description: 'Device config retrieved' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async getConfig(@Param('pairingCode') pairingCode: string) {
    return this.devicesService.getByPairingCode(pairingCode);
  }
}
