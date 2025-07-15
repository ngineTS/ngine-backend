import { Module } from '@nestjs/common';
import { TestTextService } from './test-text.service';
import { TestTextController } from './test-text.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestText } from './entities/test-text.entity';

@Module({
  imports:[TypeOrmModule.forFeature([TestText])],
  controllers: [TestTextController],
  providers: [TestTextService],
})
export class TestTextModule {}
