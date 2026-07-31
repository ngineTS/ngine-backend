import { forwardRef, Module } from '@nestjs/common';
import { ContainerLayoutService } from './container-layout.service';
import { ContainerLayoutController } from './container-layout.controller';
import { ContainerLayout } from './entities/container-layout.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { containerLayoutValidatorService } from './container-layout-validator.service';
import { Navigation } from '../navigation/entities/navigation.entity';
import { NavigationModule } from '../navigation/navigation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContainerLayout, Navigation]),
    forwardRef(() => NavigationModule)
  ],
  controllers: [ContainerLayoutController],
  providers: [ContainerLayoutService, containerLayoutValidatorService],
  exports: [ContainerLayoutService]
})
export class ContainerLayoutModule {}
