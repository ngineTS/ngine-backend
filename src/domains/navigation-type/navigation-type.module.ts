import { Module } from '@nestjs/common';
import { NavigationTypeService } from './navigation-type.service';
import { NavigationTypeController } from './navigation-type.controller';

@Module({
  controllers: [NavigationTypeController],
  providers: [NavigationTypeService],
})
export class NavigationTypeModule {}
