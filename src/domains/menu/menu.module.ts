import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { ContainerLayout } from '../container-layout/entities/container-layout.entity';
import { ContainerStyle } from '../container-style/entities/container-style.entity';
import { TypographyStyle } from '../typography-style/entities/typography-style.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Menu, ContainerLayout, ContainerStyle, TypographyStyle])],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
