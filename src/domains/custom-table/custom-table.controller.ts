import { Controller, Get, Body, Patch, Param, Delete, Post, UseGuards, Request } from '@nestjs/common';
import { CustomTableService } from './custom-table.service';
import { NavigationTypeNameArray, Permission } from 'src/core/decorators/role.decorator';
import { RolesGuard } from 'src/core/guards/role.guard';
import { CustomTableValidatorService } from './custom-table-validator.service';
import { UserNavigationPermissions } from 'src/core/decorators/user-navigation-permissions.decorator';
import { NavigationPermissions } from 'src/core/models/navigation-permissions.interface';

@Controller('custom-table')
export class CustomTableController {

  constructor(
    private readonly customTableService: CustomTableService,
    private readonly _customTableValidatorService: CustomTableValidatorService
  ) {}

  @Get('table/:tableName')
  async findTableContentByTableName(
    @Param('tableName') tableName: string,
    @UserNavigationPermissions() userNavigationPermissions: NavigationPermissions
  ) {
    await this._customTableValidatorService.validPermission(tableName, 'view', userNavigationPermissions);
    return this.customTableService.findTableContentByTableName(tableName);
  }

  @Post(':tableName')
  async addTableRow(
    @Param('tableName') tableName: string, 
    @Body() payload: any,
    @UserNavigationPermissions() userNavigationPermissions: NavigationPermissions
  ) {
    await this._customTableValidatorService.validPermission(tableName, 'add', userNavigationPermissions);
    return this.customTableService.addTableRow(tableName, payload);
  }

  @Patch(':tableName/:id')
  async updateTableRow(
    @Param('tableName') tableName: string,
    @Param('id') id: string,  
    @Body() payload: any,
    @UserNavigationPermissions() userNavigationPermissions: NavigationPermissions
  ) {
    await this._customTableValidatorService.validPermission(tableName, 'edit', userNavigationPermissions);
    return this.customTableService.updateTableRow(tableName, id, payload);
  }

  @Delete(':tableName/:id')
  async deleteTableRow(
    @Param('tableName') tableName: string,
    @Param('id') id: string,
    @UserNavigationPermissions() userNavigationPermissions: NavigationPermissions
  ) {
    await this._customTableValidatorService.validPermission(tableName, 'delete', userNavigationPermissions);
    return this.customTableService.deleteTableRow(tableName, id);
  }

}
