import { Controller, Get, Post, Param, Req, Res } from '@nestjs/common';
import { StripePaymentService } from './stripe-payment.service';
import { Public } from 'src/core/auth/auth.guard';
import { UserId } from 'src/core/decorators/user.decorator';
import { Request, Response } from 'express';

@Controller('stripe-payment')
export class StripePaymentController {
  constructor(private readonly stripePaymentService: StripePaymentService) {}

  /**
   * Create Stripe checkout session by returning an url where user will fill payment information.
   * 
   * @param priceId The stripe reference of the product.
   * @param roleId The role id selected by user.
   * @param userId The user id.
   * @returns The session url to process to the payment.
   */
  @Public()
  @Get('create-checkout-session/:priceId/:roleId')
  create(
    @Param('priceId') priceId: string,
    @Param('roleId') roleId: string,
    @UserId() userId: string
  ) {
    return this.stripePaymentService.createCheckoutSession(priceId, userId, roleId);
  }

  /**
   * This endpoint is called by stripe platform on event during the checkout/payment process.
   * It used to insure the payment has been successfull before assigning roleId to the user.
   * 
   * In production, the route name has to be registered in your stripe dashboard.
   * 
   * In local, to test this enpoint, follow the below process:
   * 
   * 1. Install Stripe CLI: `npm i -g @ stripe/cli @ latest`
   * 2. Login to stripe from terminal: `stripe login`
   * 3. Send event: `stripe listen --forward-to localhost:3000/api/stripe-payment/webhook`
   * 4. Trigger event: `stripe trigger checkout_session.completed 
   *    --override checkout_session:client_reference_id=user_123
   *    --override checkout_session:"metadata[roleId]"=role_456`
   *
   */
  @Public()
  @Post('webhook')
  handleWebhook(@Req() req: Request, @Res() res: Response) {
    this.stripePaymentService.handleWebhook(req, res);
  }

}
