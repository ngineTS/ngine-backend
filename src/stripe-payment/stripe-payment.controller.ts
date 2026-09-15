import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StripePaymentService } from './stripe-payment.service';
import { UpdateStripePaymentDto } from './dto/update-stripe-payment.dto';
import { Public } from 'src/core/auth/auth.guard';
import { UserId } from 'src/core/decorators/user.decorator';

@Controller('stripe-payment')
export class StripePaymentController {
  constructor(private readonly stripePaymentService: StripePaymentService) {}

  @Public()
  @Get('create-checkout-session/:priceId/:roleId')
  create(
    @Param('priceId') priceId: string,
    @Param('roleId') roleId: string,
    @UserId() userId: string
  ) {
    return this.stripePaymentService.createCheckoutSession(priceId, userId, roleId);
  }

}
