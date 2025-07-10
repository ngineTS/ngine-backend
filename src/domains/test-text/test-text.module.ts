import { Module } from '@nestjs/common';
import { TestTextService } from './test-text.service';
import { TestTextController } from './test-text.controller';

@Module({
  controllers: [TestTextController],
  providers: [TestTextService],
})
export class TestTextModule {}
