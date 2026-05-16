import { Module } from '@nestjs/common';
import { UserRoleService } from './user-role.service';
import { UserRoleController } from './user-role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from './entities/user-role.entity';
import { User } from '../user/entities/user.entity';
import { UserRoleValidatorService } from './user-role-validator.service';

@Module({
  imports:[TypeOrmModule.forFeature([User, UserRole])],
  controllers: [UserRoleController],
  providers: [UserRoleService, UserRoleValidatorService],
})
export class UserRoleModule {}
