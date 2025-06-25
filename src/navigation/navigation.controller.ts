import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';

@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Post()
  create(@Body() createNavigationDto: CreateNavigationDto) {
    return this.navigationService.create(createNavigationDto);
  }

  @Get()
  findAll() {
    return this.navigationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.navigationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNavigationDto: UpdateNavigationDto) {
    return this.navigationService.update(+id, updateNavigationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.navigationService.remove(+id);
  }
}
