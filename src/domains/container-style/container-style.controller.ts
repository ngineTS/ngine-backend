import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContainerStyleService } from './container-style.service';
import { CreateContainerStyleDto } from './dto/create-container-style.dto';
import { UpdateContainerStyleDto } from './dto/update-container-style.dto';

@Controller('container-style')
export class ContainerStyleController {
  constructor(private readonly containerStyleService: ContainerStyleService) {}

  @Post()
  create(@Body() createContainerStyleDto: CreateContainerStyleDto) {
    return this.containerStyleService.create(createContainerStyleDto);
  }

  @Get()
  findAll() {
    return this.containerStyleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.containerStyleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContainerStyleDto: UpdateContainerStyleDto) {
    return this.containerStyleService.update(+id, updateContainerStyleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.containerStyleService.remove(+id);
  }
}
