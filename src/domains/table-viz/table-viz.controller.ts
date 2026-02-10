import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { TableVizService } from './table-viz.service';
import { CreateTableVizDto } from './dto/create-table-viz.dto';
import { UpdateTableVizDto } from './dto/update-table-viz.dto';
import { Feature, Permission } from 'src/core/decorators/role.decorator';
import { RolesGuard } from 'src/core/guards/role.guard';

@Feature('TableViz')
@Controller('table-viz')
export class TableVizController {
  
  constructor(private readonly tableVizService: TableVizService) {}

  @Post()
  @Permission('add')
  @UseGuards(RolesGuard)
  create(@Body() createTableVizDto: CreateTableVizDto) {
    return this.tableVizService.create(createTableVizDto);
  }

  @Get('navigation/:navigationId')
  @Permission('view')
  @UseGuards(RolesGuard)
  findByNavigationId(@Param('navigationId') navigationId: string) {
    return this.tableVizService.findByNavigationId(navigationId);
  }

  @Get('table-names') 
  findTableNames() {
    return this.tableVizService.findTableNames();
  }

  @Get('table-content/:tableName')
  findTableContentByTableName(@Param('tableName') tableName: string) {
    return this.tableVizService.findTableContentByTableName(tableName);
  }

  @Permission('edit')
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTableVizDto: UpdateTableVizDto) {
    return this.tableVizService.update(id, updateTableVizDto);
  }

}
