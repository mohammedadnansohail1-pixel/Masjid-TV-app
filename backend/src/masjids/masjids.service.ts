import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateMasjidDto, UpdateMasjidDto } from './dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class MasjidsService {
  constructor(private prisma: PrismaService) {}

  async create(createMasjidDto: CreateMasjidDto, userId: string) {
    // Check if slug already exists
    const existing = await this.prisma.masjid.findUnique({
      where: { slug: createMasjidDto.slug },
    });

    if (existing) {
      throw new ConflictException('A masjid with this slug already exists');
    }

    const masjid = await this.prisma.masjid.create({
      data: createMasjidDto,
    });

    return {
      success: true,
      data: masjid,
    };
  }

  async findAll(user: any) {
    // Super admins can see all masjids
    if (user.role === UserRole.SUPER_ADMIN) {
      const masjids = await this.prisma.masjid.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: masjids,
        meta: {
          total: masjids.length,
        },
      };
    }

    // Regular users can only see their own masjid
    if (!user.masjidId) {
      return {
        success: true,
        data: [],
        meta: { total: 0 },
      };
    }

    const masjid = await this.prisma.masjid.findUnique({
      where: { id: user.masjidId },
    });

    return {
      success: true,
      data: masjid ? [masjid] : [],
      meta: { total: masjid ? 1 : 0 },
    };
  }

  async findOne(id: string, user: any) {
    const masjid = await this.prisma.masjid.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            devices: true,
            announcements: true,
            campaigns: true,
          },
        },
      },
    });

    if (!masjid) {
      throw new NotFoundException('Masjid not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== id) {
      throw new ForbiddenException('You do not have access to this masjid');
    }

    return {
      success: true,
      data: masjid,
    };
  }

  async findBySlug(slug: string) {
    const masjid = await this.prisma.masjid.findUnique({
      where: { slug },
    });

    if (!masjid) {
      throw new NotFoundException('Masjid not found');
    }

    return {
      success: true,
      data: masjid,
    };
  }

  async update(id: string, updateMasjidDto: UpdateMasjidDto, user: any) {
    // Check if masjid exists
    const masjid = await this.prisma.masjid.findUnique({
      where: { id },
    });

    if (!masjid) {
      throw new NotFoundException('Masjid not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== id) {
      throw new ForbiddenException('You do not have access to this masjid');
    }

    // If updating slug, check for conflicts
    if (updateMasjidDto.slug && updateMasjidDto.slug !== masjid.slug) {
      const existing = await this.prisma.masjid.findUnique({
        where: { slug: updateMasjidDto.slug },
      });

      if (existing) {
        throw new ConflictException('A masjid with this slug already exists');
      }
    }

    const updated = await this.prisma.masjid.update({
      where: { id },
      data: updateMasjidDto,
    });

    return {
      success: true,
      data: updated,
    };
  }

  async remove(id: string, user: any) {
    // Only super admins can delete masjids
    if (user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can delete masjids');
    }

    const masjid = await this.prisma.masjid.findUnique({
      where: { id },
    });

    if (!masjid) {
      throw new NotFoundException('Masjid not found');
    }

    await this.prisma.masjid.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Masjid deleted successfully',
    };
  }

  async updateCalculationSettings(
    id: string,
    settings: {
      calculationMethod?: any;
      asrCalculation?: any;
      highLatitudeRule?: any;
    },
    user: any,
  ) {
    const masjid = await this.prisma.masjid.findUnique({
      where: { id },
    });

    if (!masjid) {
      throw new NotFoundException('Masjid not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== id) {
      throw new ForbiddenException('You do not have access to this masjid');
    }

    const updated = await this.prisma.masjid.update({
      where: { id },
      data: settings as any,
    });

    return {
      success: true,
      data: updated,
    };
  }
}
