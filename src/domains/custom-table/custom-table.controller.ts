import { Controller, Get, Body, Patch, Param, Delete, Post, UseGuards, Request } from '@nestjs/common';
import { CustomTableService } from './custom-table.service';
import { NavigationTypeNameArray, Permission } from 'src/core/decorators/role.decorator';
import { RolesGuard } from 'src/core/guards/role.guard';

@Controller('custom-table')
export class CustomTableController {
  constructor(private readonly customTableService: CustomTableService) {}

  @Get('table/:tableName')
  findTableContentByTableName(
    @Param('tableName') tableName: string,
    @Request() req
  ) {
    return this.customTableService.findTableContentByTableName(
      tableName,
      req.user.userNavigationPermissions
    );
  }

  @Post(':tableName')
  saveTableContent(
    @Param('tableName') tableName: string, 
    @Body() payload: any,
    @Request() req
  ) {
    return this.customTableService.saveTableContent(
      tableName,
      payload,
      req.user.userNavigationPermissions
    );
  }


  @Patch(':tableName/:id')
  updateTableRow(
    @Param('tableName') tableName: string,
    @Param('id') id: string,  
    @Body() payload: any,
    @Request() req
  ) {
    return this.customTableService.updateTableRow(
      tableName,
      id,
      payload,
      req.user.userNavigationPermissions
    );
  }


  @Delete(':tableName/:id')
  deleteTableRow(
    @Param('tableName') tableName: string,
    @Param('id') id: string,
    @Request() req
  ) {
    return this.customTableService.deleteTableRow(
      tableName,
      id,
      req.user.userNavigationPermissions
    );
  }

}
