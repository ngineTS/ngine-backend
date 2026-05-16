import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { TableVizService } from './table-viz.service';
import { CreateTableVizDto } from './dto/create-table-viz.dto';
import { UpdateTableVizDto } from './dto/update-table-viz.dto';
import { Feature, NavigationTypeNameArray, Permission } from 'src/core/decorators/role.decorator';
import { RolesGuard } from 'src/core/guards/role.guard';
import { CustomTableValidatorService } from '../custom-table/custom-table-validator.service';
import { UserNavigationPermissions } from 'src/core/decorators/user-navigation-permissions.decorator';
import { NavigationPermissions } from 'src/core/models/navigation-permissions.interface';

@Feature('TableViz')
@NavigationTypeNameArray(['content-visualization', 'content-management'])
@Controller('table-viz')
export class TableVizController {

  constructor(
    private readonly _tableVizService: TableVizService,
    private readonly _customTableValidatorService: CustomTableValidatorService
  ) {}

  @Permission('add')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createTableVizDto: CreateTableVizDto) {
    return this._tableVizService.create(createTableVizDto);
  }

  @Permission('view')
  @UseGuards(RolesGuard)
  @Get('navigation/:navigationId')
  findByNavigationId(@Param('navigationId') navigationId: string) {
    return this._tableVizService.findByNavigationId(navigationId);
  }

  @Get('table-names') 
  findTableNames() {
    return this._tableVizService.findTableNames();
  }

  @Get('table-content/:tableName')
  async findTableContentByTableName(
    @Param('tableName') tableName: string,
    @UserNavigationPermissions() userNavigationPermissions: NavigationPermissions
  ) {
    await this._customTableValidatorService.validPermission(
      tableName,
      'view', 
    userNavigationPermissions
  );
    return this._tableVizService.findTableContentByTableName(tableName);
  }

  @Permission('edit')
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTableVizDto: UpdateTableVizDto) {
    return this._tableVizService.update(id, updateTableVizDto);
  }

}
