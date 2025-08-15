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

  @Get()
  findAll() {
    return this.tableVizService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tableVizService.findOne(+id);
  }

  @Get('navigation/:navigationId')
  findByNavigationId(@Param('navigationId') navigationId: string) {
    return this.tableVizService.findByNavigationId(navigationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTableVizDto: UpdateTableVizDto) {
    return this.tableVizService.update(id, updateTableVizDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tableVizService.remove(+id);
  }
}
