import { Module } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import { NavigationController } from './navigation.controller';
import { Navigation } from './entities/navigation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { RoleNavigationPermission } from '../role-navigation-permission/entities/role-navigation-permission.entity';
import { UserRole } from '../user-role/entities/user-role.entity';
import { RoleService } from '../role/role.service';
import { AuthService } from 'src/core/auth/auth.service';
import { Role } from '../role/entities/role.entity';
import { MenuService } from '../menu/menu.service';
import { Menu } from '../menu/entities/menu.entity';
import { ContainerLayout } from '../container-layout/entities/container-layout.entity';
import { ContainerStyle } from '../container-style/entities/container-style.entity';
import { TypographyStyle } from '../typography-style/entities/typography-style.entity';
import { NavigationType } from '../navigation-type/entities/navigation-type.entity';
import { NavigationValidatorService } from './navigation-validator.service';
import { RoleValidatorService } from '../role/role-validator.service';
import { MenuValidatorService } from '../menu/menu-validator.service';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      Navigation,
      NavigationType,
      User,
      UserRole,
      Role,
      RoleNavigationPermission,
      Menu,
      ContainerLayout,
      ContainerStyle,
      TypographyStyle
    ])
  ],
  controllers: [NavigationController],
  providers: [
    NavigationValidatorService,
    NavigationService,
    RoleService,
    RoleValidatorService,
    AuthService,
    MenuService,
    MenuValidatorService
  ]
})
export class NavigationModule {}
