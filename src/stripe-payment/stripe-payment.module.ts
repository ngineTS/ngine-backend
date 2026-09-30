import { Module } from '@nestjs/common';
import { StripePaymentService } from './stripe-payment.service';
import { StripePaymentController } from './stripe-payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from 'src/domains/user-role/entities/user-role.entity';
import { AuthService } from 'src/core/auth/auth.service';
import { AuthModule } from 'src/core/auth/auth.module';
import { User } from 'src/domains/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole, User])],
  controllers: [StripePaymentController],
  providers: [StripePaymentService, AuthService],
})
export class StripePaymentModule {}
