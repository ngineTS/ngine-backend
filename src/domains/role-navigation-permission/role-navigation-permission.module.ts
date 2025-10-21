import { Module } from '@nestjs/common';
import { RoleNavigationPermissionService } from './role-navigation-permission.service';
import { RoleNavigationPermissionController } from './role-navigation-permission.controller';

@Module({
  controllers: [RoleNavigationPermissionController],
  providers: [RoleNavigationPermissionService],
})
export class RoleNavigationPermissionModule {}
