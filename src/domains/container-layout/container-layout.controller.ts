import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContainerLayoutService } from './container-layout.service';
import { CreateContainerLayoutDto } from './dto/create-container-layout.dto';
import { UpdateContainerLayoutDto } from './dto/update-container-layout.dto';

@Controller('container-layout')
export class ContainerLayoutController {
  constructor(private readonly containerLayoutService: ContainerLayoutService) {}

  @Post()
  create(@Body() createContainerLayoutDto: CreateContainerLayoutDto) {
    return this.containerLayoutService.create(createContainerLayoutDto);
  }

  @Get()
  findAll() {
    return this.containerLayoutService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.containerLayoutService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContainerLayoutDto: UpdateContainerLayoutDto) {
    return this.containerLayoutService.update(id, updateContainerLayoutDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.containerLayoutService.remove(+id);
  }
}
