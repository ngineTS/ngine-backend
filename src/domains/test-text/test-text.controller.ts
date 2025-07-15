import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TestTextService } from './test-text.service';
import { CreateTestTextDto } from './dto/create-test-text.dto';
import { UpdateTestTextDto } from './dto/update-test-text.dto';

@Controller('test-text')
export class TestTextController {
  constructor(private readonly testTextService: TestTextService) {}

  @Post()
  create(@Body() createTestTextDto: CreateTestTextDto) {
    return this.testTextService.create(createTestTextDto);
  }

  @Get()
  findAll() {
    return this.testTextService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testTextService.findOne(+id);
  }

  @Get('/navigation/:navigationId')
  findbyNavigationId(@Param('navigationId') navigationId: string) {
    return this.testTextService.findByNavigationId(navigationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTestTextDto: UpdateTestTextDto) {
    return this.testTextService.update(+id, updateTestTextDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testTextService.remove(+id);
  }
}
