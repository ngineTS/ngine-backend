import { Module } from '@nestjs/common';
import { ContainerStyleService } from './container-style.service';
import { ContainerStyleController } from './container-style.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContainerStyle } from './entities/container-style.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContainerStyle])],
  controllers: [ContainerStyleController],
  providers: [ContainerStyleService],
})
export class ContainerStyleModule {}
