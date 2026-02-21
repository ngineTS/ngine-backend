import { Module } from '@nestjs/common';
import { ContainerLayoutService } from './container-layout.service';
import { ContainerLayoutController } from './container-layout.controller';
import { ContainerLayout } from './entities/container-layout.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { containerLayoutValidatorService } from './container-layout-validator.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContainerLayout])],
  controllers: [ContainerLayoutController],
  providers: [ContainerLayoutService, containerLayoutValidatorService],
})
export class ContainerLayoutModule {}
