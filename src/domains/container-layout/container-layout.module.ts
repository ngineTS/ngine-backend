import { Module } from '@nestjs/common';
import { ContainerLayoutService } from './container-layout.service';
import { ContainerLayoutController } from './container-layout.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContainerLayout } from './entities/container-layout.entity';

@Module({
  imports:[TypeOrmModule.forFeature([ContainerLayout])],
  controllers: [ContainerLayoutController],
  providers: [ContainerLayoutService],
})
export class ContainerLayoutModule {}
