import { Module } from '@nestjs/common';
import { ContainerLayoutService } from './container-layout.service';
import { ContainerLayoutController } from './container-layout.controller';
import { ContainerLayout } from './entities/container-layout.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { containerLayoutValidatorService } from './container-layout-validator.service';
import { NavigationService } from '../navigation/navigation.service';
import { Navigation } from '../navigation/entities/navigation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContainerLayout, Navigation])],
  controllers: [ContainerLayoutController],
  providers: [ContainerLayoutService, containerLayoutValidatorService, NavigationService],
})
export class ContainerLayoutModule {}
