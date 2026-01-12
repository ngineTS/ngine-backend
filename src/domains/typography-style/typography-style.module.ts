import { Module } from '@nestjs/common';
import { TypographyStyleService } from './typography-style.service';
import { TypographyStyleController } from './typography-style.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypographyStyle } from './entities/typography-style.entity';

@Module({
  imports:[TypeOrmModule.forFeature([TypographyStyle])],
  controllers: [TypographyStyleController],
  providers: [TypographyStyleService],
})
export class TypographyStyleModule {}
