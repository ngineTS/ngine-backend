import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';

@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Post()
  saveNavigation(@Body() createNavigationDto: CreateNavigationDto) {
    return this.navigationService.saveNavigation(createNavigationDto);
  }

  @Get()
  findNestedNavigations() {
    return this.navigationService.findNestedNavigations();
  }

  @Get('flat')
  findAllNavigations() {
    return this.navigationService.findAllNavigations();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.navigationService.findOne(+id);
  }

  @Patch(':id')
  updateNavigation(@Param('id') id: string, @Body() updateNavigationDto: UpdateNavigationDto) {
    return this.navigationService.updateNavigation(id, updateNavigationDto);
  }

  @Post('order')
  saveNavigationOrders(@Body() updateOrderNavigationDtoArray: UpdateNavigationDto[]) {
    return this.navigationService.saveNavigationOrders(updateOrderNavigationDtoArray);
  }

  @Post('multiple-delete')
  removeNavigationAndChildren(@Body() ids: string[]) {
    return this.navigationService.removeNavigationAndChildren(ids);
  }

}
