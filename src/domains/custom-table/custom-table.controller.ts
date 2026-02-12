import { Controller, Get, Body, Patch, Param, Delete, Post } from '@nestjs/common';
import { CustomTableService } from './custom-table.service';

@Controller('custom-table')
export class CustomTableController {
  constructor(private readonly customTableService: CustomTableService) {}

  @Get('table/:tableName')
  findTableContentByTableName(@Param('tableName') tableName: string) {
    return this.customTableService.findTableContentByTableName(tableName);
  }

  @Post(':tableName')
  saveTableContent(
    @Param('tableName') tableName: string, 
    @Body() payload: any) {
    return this.customTableService.saveTableContent(tableName, payload);
  }

  @Patch(':tableName/:id')
  updateTableRow(
    @Param('tableName') tableName: string,
    @Param('id') id: string,  
    @Body() payload: any) {
    return this.customTableService.updateTableRow(tableName, id, payload);
  }

  @Delete(':tableName/:id')
  deleteTableRow(
    @Param('tableName') tableName: string,
    @Param('id') id: string ) {
    return this.customTableService.deleteTableRow(tableName, id);
  }

}
