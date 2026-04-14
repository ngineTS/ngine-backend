import { Module } from '@nestjs/common';
import { CustomTableService } from './custom-table.service';
import { CustomTableController } from './custom-table.controller';
import { CustomTableValidatorService } from './custom-table-validator.service';

@Module({
  controllers: [CustomTableController],
  providers: [CustomTableService],
})
export class CustomTableModule {}
