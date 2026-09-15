import { BadRequestException, Injectable } from '@nestjs/common';
import Stripe = require('stripe');
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/domains/user-role/entities/user-role.entity';
import { Repository } from 'typeorm';
import { AuthService } from 'src/core/auth/auth.service';

@Injectable()
export class StripePaymentService {

  constructor(
    @InjectRepository(UserRole)
    private _userRoleRepository: Repository<UserRole>,
    private _authService: AuthService
  ) {
    this.stripe = new Stripe(
      'test-k',
    );
  }

  stripe: Stripe;
  currency = "USD";
  successUrl = "http://localhost:4200/success";
  cancelUrl = "http://localhost:4200/cancel"

  /**
   * Create Stripe checkout session by returning an url where user will fill payment information.
   * 
   * @param priceId The stripe reference of the product.
   * @param roleId The role id selected by user.
   * @param userId The user id.
   * @returns The session url to process to the payment.
   * @throws {BadRequestException} if no auth pack is found for given role and price id.
   */
  async createCheckoutSession(
    priceId: string,
    userId: string,
    roleId: string
  ) {
    const authPack = await this._authService.getAuthPackByPriceAndRoleId(priceId, roleId);
    if (!authPack || authPack.length === 0) {
      throw new BadRequestException(`No authentication pack found for price id ${priceId} and role id ${roleId}.`)
    }

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

  /**
   * Assign roleId to the user if payment has been successful.
   * 
   * 1. Get signature and body from the request and valid them against webhook secret key
   * 2. If event is a payment successful then assign roleId to the user.
   * 
   * @param req The request information.
   * @param res The response to return.
   * @returns A confirmation of webhook reception.
   */
  async handleWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;
    
    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        sig!,
        'whsec'
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const roleId = session.metadata?.roleId;

      if (userId && roleId && session.payment_status === 'paid') {
        const userRoles = await this._userRoleRepository.find({
          where: { userId: userId }
        });

        if (userRoles.find(obj => obj.roleId === roleId)) {
          throw new BadRequestException(`Role id ${roleId} already assigned to the user`);
        }

        await this._userRoleRepository.save({ userId: userId, roleId: roleId });
      }
    }

    res.json({ received: true });
  }
}
