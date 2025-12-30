import { Module } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import { NavigationController } from './navigation.controller';
import { Navigation } from './entities/navigation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavigationType } from '../navigation-type/entities/navigation-type.entity';
import { User } from '../user/entities/user.entity';
import { HeaderBar } from '../header-bar/entities/header-bar.entity';
import { RoleNavigationPermission } from '../role-navigation-permission/entities/role-navigation-permission.entity';
import { UserRole } from '../user-role/entities/user-role.entity';
import { RoleService } from '../role/role.service';
import { AuthService } from 'src/core/auth/auth.service';
import { Role } from '../role/entities/role.entity';

@Module({
  imports:[TypeOrmModule.forFeature([
    Navigation,
    NavigationType,
    HeaderBar,
    User,
    UserRole,
    Role,
    RoleNavigationPermission
  ])],
  controllers: [NavigationController],
  providers: [NavigationService, RoleService, AuthService]
})
export class NavigationModule {}
