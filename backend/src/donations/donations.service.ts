import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { StripeService } from './stripe.service';
import { CreateDonationDto } from './dto';
import { UserRole, DonationStatus } from '@prisma/client';

@Injectable()
export class DonationsService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  /**
   * Create a donation and payment intent
   */
  async create(createDto: CreateDonationDto) {
    // Verify masjid exists
    const masjid = await this.prisma.masjid.findUnique({
      where: { id: createDto.masjidId },
    });

    if (!masjid) {
      throw new NotFoundException('Masjid not found');
    }

    // Verify campaign exists if provided
    if (createDto.campaignId) {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: createDto.campaignId },
      });

      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }

      if (campaign.masjidId !== createDto.masjidId) {
        throw new BadRequestException('Campaign does not belong to this masjid');
      }
    }

    // Create payment intent for card payments
    let paymentIntentId: string | null = null;
    let clientSecret: string | null = null;

    if (createDto.paymentMethod === 'CARD') {
      const paymentIntent = await this.stripeService.createPaymentIntent(
        createDto.amount,
        createDto.currency || 'USD',
        {
          masjidId: createDto.masjidId,
          campaignId: createDto.campaignId || '',
        },
      );

      paymentIntentId = paymentIntent.paymentIntentId;
      clientSecret = paymentIntent.clientSecret;
    }

    // Create donation record
    const donation = await this.prisma.donation.create({
      data: {
        ...createDto,
        transactionId: paymentIntentId,
        status: createDto.paymentMethod === 'CARD' ? DonationStatus.PENDING : DonationStatus.COMPLETED,
      },
    });

    return {
      success: true,
      data: {
        donation,
        clientSecret, // For Stripe payment
      },
    };
  }

  /**
   * Get all donations for a masjid
   */
  async findAll(masjidId: string, user: any) {
    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== masjidId) {
      throw new ForbiddenException('You do not have access to this masjid');
    }

    const donations = await this.prisma.donation.findMany({
      where: { masjidId },
      include: {
        campaign: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: donations,
      meta: {
        total: donations.length,
      },
    };
  }

  /**
   * Get a specific donation
   */
  async findOne(id: string, user: any) {
    const donation = await this.prisma.donation.findUnique({
      where: { id },
      include: {
        masjid: true,
        campaign: true,
      },
    });

    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== donation.masjidId) {
      throw new ForbiddenException('You do not have access to this donation');
    }

    return {
      success: true,
      data: donation,
    };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(event: any) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { success: true };
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(paymentIntent: any) {
    const donation = await this.prisma.donation.findFirst({
      where: { transactionId: paymentIntent.id },
    });

    if (donation) {
      await this.prisma.donation.update({
        where: { id: donation.id },
        data: {
          status: DonationStatus.COMPLETED,
          metadata: paymentIntent,
        },
      });
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailure(paymentIntent: any) {
    const donation = await this.prisma.donation.findFirst({
      where: { transactionId: paymentIntent.id },
    });

    if (donation) {
      await this.prisma.donation.update({
        where: { id: donation.id },
        data: {
          status: DonationStatus.FAILED,
          metadata: paymentIntent,
        },
      });
    }
  }

  /**
   * Get donation statistics for a masjid
   */
  async getStats(masjidId: string, user: any, campaignId?: string) {
    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== masjidId) {
      throw new ForbiddenException('You do not have access to this masjid');
    }

    const where: any = {
      masjidId,
      status: DonationStatus.COMPLETED,
    };

    if (campaignId) {
      where.campaignId = campaignId;
    }

    const donations = await this.prisma.donation.findMany({
      where,
    });

    const totalAmount = donations.reduce(
      (sum, donation) => sum + Number(donation.amount),
      0,
    );

    const donorCount = new Set(
      donations
        .filter(d => !d.isAnonymous && d.donorEmail)
        .map(d => d.donorEmail)
    ).size;

    const recurringCount = donations.filter(d => d.isRecurring).length;

    return {
      success: true,
      data: {
        totalDonations: donations.length,
        totalAmount,
        averageDonation: donations.length > 0 ? totalAmount / donations.length : 0,
        uniqueDonors: donorCount,
        recurringDonations: recurringCount,
        currency: donations[0]?.currency || 'USD',
      },
    };
  }

  /**
   * Refund a donation
   */
  async refund(id: string, user: any) {
    const donation = await this.prisma.donation.findUnique({
      where: { id },
    });

    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    // Check authorization
    if (user.role !== UserRole.SUPER_ADMIN && user.masjidId !== donation.masjidId) {
      throw new ForbiddenException('You do not have access to this donation');
    }

    if (donation.status !== DonationStatus.COMPLETED) {
      throw new BadRequestException('Only completed donations can be refunded');
    }

    if (!donation.transactionId) {
      throw new BadRequestException('No transaction ID found for this donation');
    }

    // Process refund through Stripe
    const refund = await this.stripeService.refundPayment(donation.transactionId);

    // Update donation status
    await this.prisma.donation.update({
      where: { id },
      data: {
        status: DonationStatus.REFUNDED,
      },
    });

    return {
      success: true,
      message: 'Donation refunded successfully',
      data: { refund },
    };
  }
}
