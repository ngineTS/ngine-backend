import { Module } from '@nestjs/common';
import { TableVizService } from './table-viz.service';
import { TableVizController } from './table-viz.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableViz } from './entities/table-viz.entity';
import { CustomTableValidatorService } from '../custom-table/custom-table-validator.service';
import { CustomTableService } from '../custom-table/custom-table.service';

@Module({
  imports:[TypeOrmModule.forFeature([TableViz])],
  controllers: [TableVizController],
  providers: [
    TableVizService,
    CustomTableService,
    CustomTableValidatorService
  ],
})
export class TableVizModule {}
