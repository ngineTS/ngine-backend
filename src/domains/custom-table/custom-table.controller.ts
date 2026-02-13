import { Controller, Get, Body, Patch, Param, Delete, Post, UseGuards } from '@nestjs/common';
import { CustomTableService } from './custom-table.service';
import { NavigationTypeNameArray, Permission } from 'src/core/decorators/role.decorator';
import { RolesGuard } from 'src/core/guards/role.guard';


@NavigationTypeNameArray(['content-management'])
@Controller('custom-table')
export class CustomTableController {
  constructor(private readonly customTableService: CustomTableService) {}

  @Permission('view')
  @UseGuards(RolesGuard)
  @Get('table/:tableName')
  findTableContentByTableName(@Param('tableName') tableName: string) {
    return this.customTableService.findTableContentByTableName(tableName);
  }

  @Permission('add')
  @UseGuards(RolesGuard)
  @Post(':tableName')
  saveTableContent(
    @Param('tableName') tableName: string, 
    @Body() payload: any) {
    return this.customTableService.saveTableContent(tableName, payload);
  }

  @Permission('edit')
  @UseGuards(RolesGuard)
  @Patch(':tableName/:id')
  updateTableRow(
    @Param('tableName') tableName: string,
    @Param('id') id: string,  
    @Body() payload: any) {
    return this.customTableService.updateTableRow(tableName, id, payload);
  }

  @Permission('delete')
  @UseGuards(RolesGuard)
  @Delete(':tableName/:id')
  deleteTableRow(
    @Param('tableName') tableName: string,
    @Param('id') id: string ) {
    return this.customTableService.deleteTableRow(tableName, id);
  }

}
