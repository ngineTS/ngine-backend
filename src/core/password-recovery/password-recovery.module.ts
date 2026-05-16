import { Module } from '@nestjs/common';
import { PasswordRecoveryService } from './password-recovery.service';
import { PasswordRecoveryController } from './password-recovery.controller';
import { PasswordRecovery } from './entities/password-recovery.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/domains/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PasswordRecovery, User])
  ],
  controllers: [PasswordRecoveryController],
  providers: [PasswordRecoveryService]
})
export class PasswordRecoveryModule {}
