import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MediaType, UserRole } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  private readonly uploadDir = process.env.UPLOAD_DIR || './uploads';
  private readonly baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  constructor(private prisma: PrismaService) {
    // Ensure upload directory exists
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Determine media type from MIME type
   */
  private getMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) {
      return MediaType.IMAGE;
    } else if (mimeType.startsWith('video/')) {
      return MediaType.VIDEO;
    } else if (mimeType === 'application/pdf') {
      return MediaType.PDF;
    }
    throw new BadRequestException('Unsupported file type. Only images, videos, and PDFs are allowed.');
  }

  /**
   * Validate file type
   */
  private validateFileType(mimeType: string): boolean {
    const allowedTypes = [
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      // Videos
      'video/mp4',
      'video/webm',
      'video/ogg',
      // Documents
      'application/pdf',
    ];

    return allowedTypes.includes(mimeType);
  }

  /**
   * Upload a file
   */
  async uploadFile(
    file: Express.Multer.File,
    masjidId: string,
    user: any,
  ) {
    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== masjidId) {
      throw new ForbiddenException('You do not have access to this masjid');
    }

    // Verify masjid exists
    const masjid = await this.prisma.masjid.findUnique({
      where: { id: masjidId },
    });

    if (!masjid) {
      throw new NotFoundException('Masjid not found');
    }

    // Validate file type
    if (!this.validateFileType(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images, videos, and PDFs are allowed.');
    }

    // Generate unique filename
    const fileExt = path.extname(file.originalname);
    const filename = `${uuidv4()}${fileExt}`;
    const filePath = path.join(this.uploadDir, filename);

    // Save file to disk
    await fs.writeFile(filePath, file.buffer);

    // Determine media type
    const mediaType = this.getMediaType(file.mimetype);

    // Create media record
    const media = await this.prisma.media.create({
      data: {
        masjidId,
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: filePath,
        url: `${this.baseUrl}/uploads/${filename}`,
        type: mediaType,
        createdBy: user.id,
      },
    });

    return {
      success: true,
      data: media,
    };
  }

  /**
   * Get all media for a masjid
   */
  async findAll(masjidId: string, user: any, type?: MediaType) {
    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== masjidId) {
      throw new ForbiddenException('You do not have access to this masjid');
    }

    const where: any = { masjidId };
    if (type) {
      where.type = type;
    }

    const media = await this.prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: media,
      meta: {
        total: media.length,
      },
    };
  }

  /**
   * Get a specific media item
   */
  async findOne(id: string, user: any) {
    const media = await this.prisma.media.findUnique({
      where: { id },
      include: {
        masjid: true,
      },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== media.masjidId) {
      throw new ForbiddenException('You do not have access to this media');
    }

    return {
      success: true,
      data: media,
    };
  }

  /**
   * Delete a media item
   */
  async remove(id: string, user: any) {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== media.masjidId) {
      throw new ForbiddenException('You do not have access to this media');
    }

    // Delete file from disk
    try {
      await fs.unlink(media.path);
    } catch (error) {
      // Log error but continue with database deletion
      console.error(`Failed to delete file: ${media.path}`, error);
    }

    // Delete database record
    await this.prisma.media.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Media deleted successfully',
    };
  }

  /**
   * Get storage statistics for a masjid
   */
  async getStats(masjidId: string, user: any) {
    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== masjidId) {
      throw new ForbiddenException('You do not have access to this masjid');
    }

    const media = await this.prisma.media.findMany({
      where: { masjidId },
    });

    const totalSize = media.reduce((sum, item) => sum + item.size, 0);
    const countByType = media.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<MediaType, number>);

    return {
      success: true,
      data: {
        totalFiles: media.length,
        totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        countByType,
      },
    };
  }
}
