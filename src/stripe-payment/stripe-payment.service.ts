import { Injectable } from '@nestjs/common';
import { CreateStripePaymentDto } from './dto/create-stripe-payment.dto';
import { UpdateStripePaymentDto } from './dto/update-stripe-payment.dto';
import Stripe = require('stripe');

@Injectable()
export class StripePaymentService {

  
  constructor() {
    this.stripe = new Stripe(
      'sk_test',
    );
  }

  stripe: Stripe;
  currency = "USD";
  successUrl = "http://localhost:4200/success";
  cancelUrl = "http://localhost:4200/cancel"

  async createCheckoutSession(priceId: string) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: this.successUrl,
      cancel_url: this.cancelUrl,
    });

    return { url: session.url };

  }

  create(createStripePaymentDto: CreateStripePaymentDto) {
    return 'This action adds a new stripePayment';
  }

  findAll() {
    return `This action returns all stripePayment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} stripePayment`;
  }

  update(id: number, updateStripePaymentDto: UpdateStripePaymentDto) {
    return `This action updates a #${id} stripePayment`;
  }

  remove(id: number) {
    return `This action removes a #${id} stripePayment`;
  }
}
