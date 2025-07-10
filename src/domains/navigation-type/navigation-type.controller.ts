import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NavigationTypeService } from './navigation-type.service';
import { CreateNavigationTypeDto } from './dto/create-navigation-type.dto';
import { UpdateNavigationTypeDto } from './dto/update-navigation-type.dto';

@Controller('navigation-type')
export class NavigationTypeController {
  constructor(private readonly navigationTypeService: NavigationTypeService) {}

  @Post()
  create(@Body() createNavigationTypeDto: CreateNavigationTypeDto) {
    return this.navigationTypeService.create(createNavigationTypeDto);
  }

  @Get()
  findAll() {
    return this.navigationTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.navigationTypeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNavigationTypeDto: UpdateNavigationTypeDto) {
    return this.navigationTypeService.update(+id, updateNavigationTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.navigationTypeService.remove(+id);
  }
}
