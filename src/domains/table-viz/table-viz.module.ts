import { Module } from '@nestjs/common';
import { TableVizService } from './table-viz.service';
import { TableVizController } from './table-viz.controller';

@Module({
  controllers: [TableVizController],
  providers: [TableVizService],
})
export class TableVizModule {}
