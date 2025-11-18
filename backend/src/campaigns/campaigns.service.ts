import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto';
import { UserRole, DonationStatus } from '@prisma/client';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new campaign
   */
  async create(createDto: CreateCampaignDto, user: any) {
    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== createDto.masjidId) {
      throw new ForbiddenException('You do not have access to this masjid');
    }

    // Verify masjid exists
    const masjid = await this.prisma.masjid.findUnique({
      where: { id: createDto.masjidId },
    });

    if (!masjid) {
      throw new NotFoundException('Masjid not found');
    }

    // Check if slug already exists for this masjid
    const existing = await this.prisma.campaign.findUnique({
      where: {
        masjidId_slug: {
          masjidId: createDto.masjidId,
          slug: createDto.slug,
        },
      },
    });

    if (existing) {
      throw new ConflictException('A campaign with this slug already exists');
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        ...createDto,
        startDate: createDto.startDate ? new Date(createDto.startDate) : null,
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
      },
    });

    return {
      success: true,
      data: campaign,
    };
  }

  /**
   * Find all campaigns for a masjid
   */
  async findAll(masjidId: string, user: any) {
    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== masjidId) {
      throw new ForbiddenException('You do not have access to this masjid');
    }

    const campaigns = await this.prisma.campaign.findMany({
      where: { masjidId },
      include: {
        _count: {
          select: {
            donations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: campaigns,
      meta: {
        total: campaigns.length,
      },
    };
  }

  /**
   * Get active campaigns (public endpoint)
   */
  async findActive(masjidId: string) {
    const now = new Date();

    const campaigns = await this.prisma.campaign.findMany({
      where: {
        masjidId,
        status: 'ACTIVE',
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      include: {
        _count: {
          select: {
            donations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: campaigns,
      meta: {
        total: campaigns.length,
      },
    };
  }

  /**
   * Find a specific campaign
   */
  async findOne(id: string, user: any) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        masjid: true,
        _count: {
          select: {
            donations: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== campaign.masjidId) {
      throw new ForbiddenException('You do not have access to this campaign');
    }

    return {
      success: true,
      data: campaign,
    };
  }

  /**
   * Find campaign by slug (public endpoint)
   */
  async findBySlug(masjidId: string, slug: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: {
        masjidId_slug: {
          masjidId,
          slug,
        },
      },
      include: {
        masjid: true,
        _count: {
          select: {
            donations: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return {
      success: true,
      data: campaign,
    };
  }

  /**
   * Update a campaign
   */
  async update(id: string, updateDto: UpdateCampaignDto, user: any) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== campaign.masjidId) {
      throw new ForbiddenException('You do not have access to this campaign');
    }

    const updated = await this.prisma.campaign.update({
      where: { id },
      data: {
        ...updateDto,
        startDate: updateDto.startDate ? new Date(updateDto.startDate) : undefined,
        endDate: updateDto.endDate ? new Date(updateDto.endDate) : undefined,
      },
    });

    return {
      success: true,
      data: updated,
    };
  }

  /**
   * Delete a campaign
   */
  async remove(id: string, user: any) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            donations: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== campaign.masjidId) {
      throw new ForbiddenException('You do not have access to this campaign');
    }

    // Prevent deletion if campaign has donations
    if (campaign._count.donations > 0) {
      throw new ForbiddenException(
        'Cannot delete campaign with existing donations. Set status to COMPLETED instead.',
      );
    }

    await this.prisma.campaign.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Campaign deleted successfully',
    };
  }

  /**
   * Get campaign statistics
   */
  async getStats(id: string, user: any) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        donations: {
          where: {
            status: DonationStatus.COMPLETED,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== campaign.masjidId) {
      throw new ForbiddenException('You do not have access to this campaign');
    }

    const totalRaised = campaign.donations.reduce(
      (sum, donation) => sum + Number(donation.amount),
      0,
    );

    const donorCount = campaign.donations.length;

    const percentageRaised = Number(campaign.goalAmount) > 0
      ? (totalRaised / Number(campaign.goalAmount)) * 100
      : 0;

    return {
      success: true,
      data: {
        campaignId: campaign.id,
        campaignName: campaign.name,
        goalAmount: Number(campaign.goalAmount),
        totalRaised,
        remaining: Number(campaign.goalAmount) - totalRaised,
        percentageRaised: Math.round(percentageRaised * 100) / 100,
        donorCount,
        currency: campaign.currency,
      },
    };
  }
}
