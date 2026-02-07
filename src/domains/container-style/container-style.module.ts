import { Module } from '@nestjs/common';
import { ContainerStyleService } from './container-style.service';
import { ContainerStyleController } from './container-style.controller';

@Module({
  controllers: [ContainerStyleController],
  providers: [ContainerStyleService],
})
export class ContainerStyleModule {}
