import { Injectable } from '@nestjs/common';
import Stripe = require('stripe');
import { Request, Response } from 'express';

@Injectable()
export class StripePaymentService {

  constructor() {
    this.stripe = new Stripe(
      'test-k',
    );
  }

  stripe: Stripe;
  currency = "USD";
  successUrl = "http://localhost:4200/success";
  cancelUrl = "http://localhost:4200/cancel"

  async createCheckoutSession(
    priceId: string,
    userId: string,
    roleId: string
  ) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{price: priceId, quantity: 1 }],
      client_reference_id: userId,
      metadata: { roleId: roleId },
      mode: 'payment',
      success_url: this.successUrl,
      cancel_url: this.cancelUrl,
    });

    return { url: session.url };
  }
}
