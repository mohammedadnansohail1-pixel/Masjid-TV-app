import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  ParseEnumPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, MediaType } from '@prisma/client';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN, UserRole.CONTENT_EDITOR)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a media file' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        masjidId: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('masjidId') masjidId: string,
    @CurrentUser() user: any,
  ) {
    return this.mediaService.uploadFile(file, masjidId, user);
  }

  @Get('masjid/:masjidId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all media for a masjid' })
  @ApiQuery({ name: 'type', required: false, enum: MediaType })
  @ApiResponse({ status: 200, description: 'Media retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Param('masjidId') masjidId: string,
    @Query('type') type?: MediaType,
    @CurrentUser() user?: any,
  ) {
    return this.mediaService.findAll(masjidId, user, type);
  }

  @Get('masjid/:masjidId/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get storage statistics for a masjid' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStats(@Param('masjidId') masjidId: string, @CurrentUser() user: any) {
    return this.mediaService.getStats(masjidId, user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific media item' })
  @ApiResponse({ status: 200, description: 'Media retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.mediaService.findOne(id, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MASJID_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a media item' })
  @ApiResponse({ status: 200, description: 'Media deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.mediaService.remove(id, user);
  }
}
