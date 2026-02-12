import { Module } from '@nestjs/common';
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

@Module({
  imports:[
    TypeOrmModule.forFeature([
      Menu,
      ContainerLayout,
      ContainerStyle,
      TypographyStyle,
      Navigation,
      NavigationType
    ])
  ],
  controllers: [MenuController],
  providers: [MenuService, MenuValidatorService],
})
export class MenuModule {}
