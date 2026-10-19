import { PartialType } from '@nestjs/mapped-types';
import { CreateStripePaymentDto } from './create-stripe-payment.dto';

export class UpdateStripePaymentDto extends PartialType(CreateStripePaymentDto) {}
