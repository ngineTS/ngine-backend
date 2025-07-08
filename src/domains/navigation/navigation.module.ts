import { Module } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import { NavigationController } from './navigation.controller';
import { Navigation } from './entities/navigation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavigationType } from '../navigation_type/entities/navigation_type.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Navigation, NavigationType])],
  controllers: [NavigationController],
  providers: [NavigationService],
})
export class NavigationModule {}
