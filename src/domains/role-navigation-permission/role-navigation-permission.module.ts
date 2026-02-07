import { Module } from '@nestjs/common';
import { RoleNavigationPermissionService } from './role-navigation-permission.service';
import { RoleNavigationPermissionController } from './role-navigation-permission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleNavigationPermission } from './entities/role-navigation-permission.entity';
import { RoleNavigationPermissionValidator } from './role-navigation-permission-validator.service';
import { Role } from '../role/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, RoleNavigationPermission])],
  controllers: [RoleNavigationPermissionController],
  providers: [RoleNavigationPermissionService, RoleNavigationPermissionValidator],
})
export class RoleNavigationPermissionModule {}
