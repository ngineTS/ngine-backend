import { Module } from '@nestjs/common';
import { StripePaymentService } from './stripe-payment.service';
import { StripePaymentController } from './stripe-payment.controller';

@Module({
  controllers: [StripePaymentController],
  providers: [StripePaymentService],
})
export class StripePaymentModule {}
