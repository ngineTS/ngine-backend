import { Module } from '@nestjs/common';
import { StripePaymentService } from './stripe-payment.service';
import { StripePaymentController } from './stripe-payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from 'src/domains/user-role/entities/user-role.entity';

@Module({
  imports:[TypeOrmModule.forFeature([UserRole])],
  controllers: [StripePaymentController],
  providers: [StripePaymentService],
})
export class StripePaymentModule {}
