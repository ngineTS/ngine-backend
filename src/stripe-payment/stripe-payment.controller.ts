import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StripePaymentService } from './stripe-payment.service';
import { UpdateStripePaymentDto } from './dto/update-stripe-payment.dto';
import { Public } from 'src/core/auth/auth.guard';

@Controller('stripe-payment')
export class StripePaymentController {
  constructor(private readonly stripePaymentService: StripePaymentService) {}

  @Public()
  @Get('create-checkout-session/:priceId')
  create(@Param('priceId') priceId: string) {
    return this.stripePaymentService.createCheckoutSession(priceId);
  }

  @Get()
  findAll() {
    return this.stripePaymentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stripePaymentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStripePaymentDto: UpdateStripePaymentDto) {
    return this.stripePaymentService.update(+id, updateStripePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stripePaymentService.remove(+id);
  }
}
