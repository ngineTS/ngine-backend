import { Module } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import { NavigationController } from './navigation.controller';
import { Navigation } from './entities/navigation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavigationType } from '../navigation-type/entities/navigation-type.entity';
import { TestText } from '../test-text/entities/test-text.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Navigation, NavigationType, TestText, User])],
  controllers: [NavigationController],
  providers: [NavigationService],
  exports: [TypeOrmModule.forFeature([Navigation, NavigationType, TestText, User]), NavigationService]
})
export class NavigationModule {}
