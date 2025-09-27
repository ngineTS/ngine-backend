import { Module } from '@nestjs/common';
import { CustomFormInputService } from './custom-form-input.service';
import { CustomFormInputController } from './custom-form-input.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomFormInput } from './entities/custom-form-input.entity';
import { CustomTableService } from '../custom-table/custom-table.service';
import { TableViz } from '../table-viz/entities/table-viz.entity';

@Module({
  imports:[TypeOrmModule.forFeature([CustomFormInput, TableViz])],
  controllers: [CustomFormInputController],
  providers: [CustomFormInputService, CustomTableService],
})
export class CustomFormInputModule {}
