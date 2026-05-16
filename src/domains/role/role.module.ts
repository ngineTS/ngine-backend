import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { UserRole } from '../user-role/entities/user-role.entity';
import { RoleNavigationPermission } from '../role-navigation-permission/entities/role-navigation-permission.entity';
import { RoleValidatorService } from './role-validator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, UserRole, RoleNavigationPermission])],
  controllers: [RoleController],
  providers: [RoleService, RoleValidatorService],
})
export class RoleModule {}
