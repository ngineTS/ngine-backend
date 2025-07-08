import { Module } from '@nestjs/common';
import { NavigationTypeService } from './navigation_type.service';
import { NavigationTypeController } from './navigation_type.controller';

@Module({
  controllers: [NavigationTypeController],
  providers: [NavigationTypeService],
})
export class NavigationTypeModule {}
