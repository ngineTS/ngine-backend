import { Module } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import { NavigationController } from './navigation.controller';
import { Navigation } from './entities/navigation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavigationType } from '../navigation-type/entities/navigation-type.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Navigation, NavigationType, User])],
  controllers: [NavigationController],
  providers: [NavigationService],
  exports: [TypeOrmModule.forFeature([Navigation, NavigationType, User]), NavigationService]
})
export class NavigationModule {}
