import { Controller, Get, Body, Patch, Param, Delete, Post } from '@nestjs/common';
import { CustomTableService } from './custom-table.service';
import { CreateCustomTableDto } from './dto/create-custom-table.dto';
import { UpdateCustomTableDto } from './dto/update-custom-table.dto';

@Controller('custom-table')
export class CustomTableController {
  constructor(private readonly customTableService: CustomTableService) {}

  @Post(':tableName')
  saveTableContent(
    @Param('tableName') tableName: string, 
    @Body() payload: any) {
    return this.customTableService.saveTableContent(tableName, payload);
  }

  @Get('table/:tableName')
  findTableContentByTableName(@Param('tableName') tableName: string) {
    return this.customTableService.findTableContentByTableName(tableName);
  }

  @Patch(':tableName/:id')
  updateTableRow(
    @Param('tableName') tableName: string,
    @Param('id') id: string,  
    @Body() updateCustomTableDto: UpdateCustomTableDto) {
    return this.customTableService.updateTableRow(tableName, id, updateCustomTableDto);
  }

  @Delete(':tableName/:id')
  deleteTableRow(
    @Param('tableName') tableName: string,
    @Param('id') id: string ) {
    return this.customTableService.deleteTableRow(tableName, id);
  }

}
