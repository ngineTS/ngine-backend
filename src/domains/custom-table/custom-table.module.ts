import { Module } from '@nestjs/common';
import { CustomTableService } from './custom-table.service';
import { CustomTableController } from './custom-table.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableViz } from '../table-viz/entities/table-viz.entity';
import { CustomFormInput } from '../custom-form-input/entities/custom-form-input.entity';

@Module({
  imports:[TypeOrmModule.forFeature([TableViz, CustomFormInput])],
  controllers: [CustomTableController],
  providers: [CustomTableService],
})
export class CustomTableModule {}
