import { Module } from '@nestjs/common';
import { TypographyStyleService } from './typography-style.service';
import { TypographyStyleController } from './typography-style.controller';

@Module({
  controllers: [TypographyStyleController],
  providers: [TypographyStyleService],
})
export class TypographyStyleModule {}
