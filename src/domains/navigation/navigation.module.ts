import { Module } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import { NavigationController } from './navigation.controller';
import { Navigation } from './entities/navigation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavigationType } from '../navigation-type/entities/navigation-type.entity';
import { User } from '../user/entities/user.entity';
import { HeaderBar } from '../header-bar/entities/header-bar.entity';

@Module({
  imports:[TypeOrmModule.forFeature([
    Navigation,
    NavigationType,
    HeaderBar,
    User
  ])],
  controllers: [NavigationController],
  providers: [NavigationService],
  exports: [TypeOrmModule.forFeature([Navigation, NavigationType, User]), NavigationService]
})
export class NavigationModule {}
