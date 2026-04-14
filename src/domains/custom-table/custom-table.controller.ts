import { Controller, Get, Body, Patch, Param, Delete, Post, UseGuards } from '@nestjs/common';
import { CustomTableService } from './custom-table.service';
import { UserNavigationPermissions } from 'src/core/decorators/user-navigation-permissions.decorator';
import { NavigationPermissions } from 'src/core/models/navigation-permissions.interface';
import { CustomTableRoleGuard } from 'src/core/guards/custom-table-role.guard';
import { CreateCustomTableDto } from './dto/create-custom-table.dto';
import { UpdateCustomTableDto } from './dto/update-custom-table.dto';

@UseGuards(CustomTableRoleGuard)
@Controller('custom-table')
export class CustomTableController {

  constructor(private readonly _customTableService: CustomTableService) { }

  @Get(':tableName/:navigationId')
  async findContentByTableNameAndNavigationId(
    @Param('tableName') tableName: string,
    @Param('navigationId') navigationId: string,
  ) {
    return this._customTableService.findContentByTableNameAndNavigationId(tableName, navigationId);
  }

  @Post(':tableName')
  async addTableRow(
    @Param('tableName') tableName: string, 
    @Body() payload: CreateCustomTableDto,
  ) {
    return this._customTableService.addTableRow(tableName, payload);
  }

  @Patch(':tableName/:id')
  async updateTableRow(
    @Param('tableName') tableName: string,
    @Param('id') id: string,  
    @Body() payload: UpdateCustomTableDto,
  ) {
    return this._customTableService.updateTableRow(tableName, id, payload);
  }

  @Delete(':tableName/:id')
  async deleteTableRow(
    @Param('tableName') tableName: string,
    @Param('id') id: string,
  ) {
    return this._customTableService.deleteTableRow(tableName, id);
  }

}
