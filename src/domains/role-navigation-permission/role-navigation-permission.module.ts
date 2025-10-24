import { Module } from '@nestjs/common';
import { RoleNavigationPermissionService } from './role-navigation-permission.service';
import { RoleNavigationPermissionController } from './role-navigation-permission.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleNavigationPermission } from './entities/role-navigation-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleNavigationPermission])],
  controllers: [RoleNavigationPermissionController],
  providers: [RoleNavigationPermissionService],
})
export class RoleNavigationPermissionModule {}
