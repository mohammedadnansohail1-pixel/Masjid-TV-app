import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe | null = null;

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;

    if (apiKey) {
      this.stripe = new Stripe(apiKey, {
        apiVersion: '2024-12-18.acacia',
      });
      this.logger.log('Stripe initialized successfully');
    } else {
      this.logger.warn('Stripe API key not found. Payment processing will be in stub mode.');
    }
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>,
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    if (!this.stripe) {
      // Stub mode - return mock data
      this.logger.warn('Stripe not configured. Returning stub payment intent.');
      return {
        clientSecret: `stub_secret_${Date.now()}`,
        paymentIntentId: `stub_pi_${Date.now()}`,
      };
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: metadata || {},
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret || '',
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      this.logger.error('Failed to create payment intent', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string,
  ): Stripe.Event {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }

  /**
   * Retrieve payment intent
   */
  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
    if (!this.stripe) {
      this.logger.warn('Stripe not configured. Cannot retrieve payment intent.');
      return null;
    }

    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error('Failed to retrieve payment intent', error);
      return null;
    }
  }

  /**
   * Create a customer
   */
  async createCustomer(
    email: string,
    name?: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Customer | null> {
    if (!this.stripe) {
      this.logger.warn('Stripe not configured. Cannot create customer.');
      return null;
    }

    try {
      return await this.stripe.customers.create({
        email,
        name,
        metadata,
      });
    } catch (error) {
      this.logger.error('Failed to create customer', error);
      return null;
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentIntentId: string, amount?: number): Promise<Stripe.Refund | null> {
    if (!this.stripe) {
      this.logger.warn('Stripe not configured. Cannot process refund.');
      return null;
    }

    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundParams.amount = Math.round(amount * 100); // Convert to cents
      }

      return await this.stripe.refunds.create(refundParams);
    } catch (error) {
      this.logger.error('Failed to process refund', error);
      return null;
    }
  }
}
