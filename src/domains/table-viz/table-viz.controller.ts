import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { TableVizService } from './table-viz.service';
import { CreateTableVizDto } from './dto/create-table-viz.dto';
import { UpdateTableVizDto } from './dto/update-table-viz.dto';
import { Feature, NavigationTypeNameArray, Permission } from 'src/core/decorators/role.decorator';
import { RolesGuard } from 'src/core/guards/role.guard';

@Feature('TableViz')
@NavigationTypeNameArray(['content-visualization', 'content-management'])
@Controller('table-viz')
export class TableVizController {
  constructor(private readonly tableVizService: TableVizService) {}

  @Permission('add')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createTableVizDto: CreateTableVizDto) {
    return this.tableVizService.create(createTableVizDto);
  }

  @Permission('view')
  @UseGuards(RolesGuard)
  @Get('navigation/:navigationId')
  findByNavigationId(@Param('navigationId') navigationId: string) {
    return this.tableVizService.findByNavigationId(navigationId);
  }

  @Get('table-names') 
  findTableNames() {
    return this.tableVizService.findTableNames();
  }

  @Get('table-content/:tableName')
  findTableContentByTableName(
    @Param('tableName') tableName: string,
    @Request() req
  ) {
    return this.tableVizService.findTableContentByTableName(
      tableName,
      req.user.userNavigationPermissions
    );
  }

  @Permission('edit')
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTableVizDto: UpdateTableVizDto) {
    return this.tableVizService.update(id, updateTableVizDto);
  }

}
