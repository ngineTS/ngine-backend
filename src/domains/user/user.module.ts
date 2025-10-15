import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PasswordRecovery } from 'src/core/password-recovery/entities/password-recovery.entity';
import { AuthService } from 'src/core/auth/auth.service';

@Module({
  imports:[TypeOrmModule.forFeature([User, PasswordRecovery])],
  controllers: [UserController],
  providers: [UserService, AuthService]
})
export class UserModule {}
