import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DonationsService } from './donations.service';
import { StripeService } from './stripe.service';
import { CreateDonationDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Request } from 'express';

@ApiTags('donations')
@Controller('donations')
export class DonationsController {
  constructor(
    private readonly donationsService: DonationsService,
    private readonly stripeService: StripeService,
  ) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a donation (public)' })
  @ApiResponse({ status: 201, description: 'Donation created with payment intent' })
  @ApiResponse({ status: 404, description: 'Masjid or campaign not found' })
  async create(@Body() createDto: CreateDonationDto) {
    return this.donationsService.create(createDto);
  }

  @Get('masjid/:masjidId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all donations for a masjid' })
  @ApiResponse({ status: 200, description: 'Donations retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Param('masjidId') masjidId: string, @CurrentUser() user: any) {
    return this.donationsService.findAll(masjidId, user);
  }

  @Get('masjid/:masjidId/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get donation statistics for a masjid' })
  @ApiQuery({ name: 'campaignId', required: false })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStats(
    @Param('masjidId') masjidId: string,
    @Query('campaignId') campaignId: string | undefined,
    @CurrentUser() user: any,
  ) {
    return this.donationsService.getStats(masjidId, user, campaignId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific donation' })
  @ApiResponse({ status: 200, description: 'Donation retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Donation not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.donationsService.findOne(id, user);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refund a donation' })
  @ApiResponse({ status: 200, description: 'Donation refunded' })
  @ApiResponse({ status: 400, description: 'Cannot refund this donation' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Donation not found' })
  async refund(@Param('id') id: string, @CurrentUser() user: any) {
    return this.donationsService.refund(id, user);
  }

  @Public()
  @Post('webhook/stripe')
  @ApiOperation({ summary: 'Stripe webhook handler (public)' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleStripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    try {
      const event = this.stripeService.verifyWebhookSignature(
        req.body,
        signature,
        webhookSecret,
      );

      return this.donationsService.handleWebhook(event);
    } catch (error) {
      throw new BadRequestException('Invalid webhook signature');
    }
  }
}
