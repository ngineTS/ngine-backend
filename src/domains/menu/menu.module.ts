import { forwardRef, Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { ContainerLayout } from '../container-layout/entities/container-layout.entity';
import { ContainerStyle } from '../container-style/entities/container-style.entity';
import { TypographyStyle } from '../typography-style/entities/typography-style.entity';
import { Navigation } from '../navigation/entities/navigation.entity';
import { NavigationType } from '../navigation-type/entities/navigation-type.entity';
import { MenuValidatorService } from './menu-validator.service';
import { ContainerLayoutService } from '../container-layout/container-layout.service';
import { ContainerStyleService } from '../container-style/container-style.service';
import { TypographyStyleService } from '../typography-style/typography-style.service';
import { NavigationModule } from '../navigation/navigation.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      Menu,
      ContainerLayout,
      ContainerStyle,
      TypographyStyle,
      Navigation,
      NavigationType,
    ]),
    forwardRef(() => NavigationModule)
  ],
  controllers: [MenuController],
  providers: [
    MenuService,
    MenuValidatorService,
    ContainerLayoutService,
    ContainerStyleService,
    TypographyStyleService,
  ],
  exports: [MenuService],
})
export class MenuModule {}
