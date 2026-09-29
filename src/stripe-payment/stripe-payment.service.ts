import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import Stripe = require('stripe');
import { Request, Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/domains/user-role/entities/user-role.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class StripePaymentService {

  constructor(
    @InjectRepository(UserRole)
    private _userRoleRepository: Repository<UserRole>,
  ) {
    this.stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY!,
    );
  }

  stripe: Stripe;
  currency = "USD";
  successUrl = "http://localhost:4200/stripe-success";
  cancelUrl = "http://localhost:4200/stripe-cancel"

  /**
   * Create Stripe checkout session by returning an url where user will fill payment information.
   * 
   * @param priceId The stripe reference of the product.
   * @param userId The user id.
   * @param roleId The role id selected by user.
   * @returns The session url to process to the payment.
   * @throws {BadRequestException} if price id is missing.
   * @throws {BadRequestException} if user id is missing.
   * @throws {BadRequestException} if role id is missing.
   */
  async createCheckoutSession(
    priceId: string,
    userId: string,
    roleId: string,
    isRecurringPayment: boolean,
  ) {
    if (!priceId) {
      throw new BadRequestException('stripe price id is required to initiate checkout session');
    }

    if (!userId) {
      throw new BadRequestException('user id is required to initiate checkout session');
    }

    if (!roleId) {
      throw new BadRequestException('role id is requiredd to initiate checkout session');
    }

    const checkoutSessionPayload: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [{price: priceId, quantity: 1 }],
      metadata: { userId, roleId },
      mode: isRecurringPayment ? 'subscription' : 'payment',
      success_url: this.successUrl,
      cancel_url: this.cancelUrl,
    }

    if (isRecurringPayment) {
      checkoutSessionPayload.subscription_data = { metadata: { userId, roleId }};
    }

    const session = await this.stripe.checkout.sessions.create(checkoutSessionPayload);

    return { url: session.url };
  }

  /**
   * Assign roleId to the user if payment has been successful.
   * 
   * 1. Get signature and body from the request and valid them against webhook secret key
   * 2. Handle below events:
   * - Case 1: Session completed - status paid -> assign role to user.
   * - Case 2: Payment fails -> remove role to user.
   * - Case 3: User subscription deleted (happens at the end of period after user cancellation) -> remove role to user.
   * 
   * @param req The request information.
   * @param res The response to return.
   * @returns A confirmation of webhook reception.
   * @throws {BadRequestException} If role is already assign to the user when session completed.
   */
  async handleWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;
    
    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        sig!,
        process.env.STRIPE_WEBHOOK_SECRET_KEY!
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    /* Case 1 */
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const roleId = session.metadata?.roleId;
      const sessionId = session.subscription as string | null;

      if (userId && roleId && session.payment_status === 'paid') {
        const userRoles = await this._userRoleRepository.find({
          where: { userId: userId }
        });

        if (userRoles.find(obj => obj.roleId === roleId)) {
          throw new BadRequestException(`Role id ${roleId} already assigned to the user`);
        }

        await this._userRoleRepository.save({
          userId: userId,
          roleId: roleId,
          stripeSubscriptionId: sessionId ?? undefined,
          createdDate: new Date(),
          createdBy: '00000000-0000-0000-0000-000000000000',
          updatedDate: new Date(),
          updatedBy: '00000000-0000-0000-0000-000000000000',
        });
      }
    }

    /* Case 2 */
    if (event.type = 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const userId = invoice.parent?.subscription_details?.metadata?.userId;
      const roleId = invoice.parent?.subscription_details?.metadata?.roleId;

      await this._userRoleRepository.update(
        { userId: userId, roleId: roleId },
        { deletedDate: new Date(), deletedBy: '00000000-0000-0000-0000-000000000000' }
      )
    }

    /* Case 3 */
    if (event.type = 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;

      await this._userRoleRepository.update(
        { stripeSubscriptionId: subscription.id },
        { deletedDate: new Date(), deletedBy: '00000000-0000-0000-0000-000000000000' }
      )
    }

    res.json({ received: true });
  }


  /**
   * Cancel user subscription for given role.
   * 
   * @param userId The user id.
   * @param roleId The role id.
   * @returns A promise of Stripe Response<Subscription>
   * @throws {BadRequestException} if stripe cancellation fails.
   */
  async cancelUserSubscription(userId: string, roleId: string) {
    const userRole = await this._userRoleRepository.findOne({
      where: {
        userId: userId,
        roleId: roleId,
        deletedDate: IsNull(),
      }
    });

    if (!userRole) {
      throw new NotFoundException(`Role id ${roleId} is not assigned to user ${userId}`);
    }

    try {
      await this.stripe.subscriptions.update(userRole.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }
    catch(error) {
      throw new BadRequestException(`Error to cancel subscription ${userRole.stripeSubscriptionId}`);
    }

    return this._userRoleRepository.update(
      { userId: userId, roleId: roleId },
      { isCancelled: true }
    );
  }

}
