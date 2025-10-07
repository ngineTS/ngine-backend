import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HeaderBarService } from './header-bar.service';
import { CreateHeaderBarDto } from './dto/create-header-bar.dto';
import { UpdateHeaderBarDto } from './dto/update-header-bar.dto';

@Controller('header-bar')
export class HeaderBarController {
  constructor(private readonly headerBarService: HeaderBarService) {}

  @Post()
  create(@Body() createHeaderBarDto: CreateHeaderBarDto) {
    return this.headerBarService.create(createHeaderBarDto);
  }

  @Get()
  findAll() {
    return this.headerBarService.findAll();
  }

  @Get('main')
  findMainHeaderBar() {
    return this.headerBarService.findMainHeaderBar();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.headerBarService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHeaderBarDto: UpdateHeaderBarDto) {
    return this.headerBarService.update(+id, updateHeaderBarDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.headerBarService.remove(+id);
  }
}
