import { Module } from '@nestjs/common';
import { NavigationTypeService } from './navigation-type.service';
import { NavigationTypeController } from './navigation-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavigationType } from './entities/navigation-type.entity';

@Module({
  imports:[TypeOrmModule.forFeature([NavigationType])],
  controllers: [NavigationTypeController],
  providers: [NavigationTypeService],
})
export class NavigationTypeModule {}
