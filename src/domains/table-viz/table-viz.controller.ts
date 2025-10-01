import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TableVizService } from './table-viz.service';
import { CreateTableVizDto } from './dto/create-table-viz.dto';
import { UpdateTableVizDto } from './dto/update-table-viz.dto';

@Controller('table-viz')
export class TableVizController {
  
  constructor(private readonly tableVizService: TableVizService) {}

  @Post()
  create(@Body() createTableVizDto: CreateTableVizDto) {
    return this.tableVizService.create(createTableVizDto);
  }

  @Get('navigation/:navigationId')
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTableVizDto: UpdateTableVizDto) {
    return this.tableVizService.update(id, updateTableVizDto);
  }

}
