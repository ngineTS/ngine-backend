import { Module } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import { NavigationController } from './navigation.controller';
import { Navigation } from './entities/navigation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavigationType } from '../navigation-type/entities/navigation-type.entity';
import { TestText } from '../test-text/entities/test-text.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Navigation, NavigationType, TestText])],
  controllers: [NavigationController],
  providers: [NavigationService],
})
export class NavigationModule {}
