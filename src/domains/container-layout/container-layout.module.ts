import { Module } from '@nestjs/common';
import { ContainerLayoutService } from './container-layout.service';
import { ContainerLayoutController } from './container-layout.controller';

@Module({
  controllers: [ContainerLayoutController],
  providers: [ContainerLayoutService],
})
export class ContainerLayoutModule {}
