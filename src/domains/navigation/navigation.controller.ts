import { Controller, Get, Post, Body, Patch, Param, Req, Request, } from '@nestjs/common';
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
  findNestedNavigations(@Request() req) {
    return this.navigationService.findNestedNavigations(req.user.sub);
  }

  @Get('flat')
  findAllNavigations() {
    return this.navigationService.findAllNavigations();
  }

  @Patch(':id')
  updateNavigation(@Param('id') id: string, @Body() updateNavigationDto: UpdateNavigationDto) {
    return this.navigationService.updateNavigation(id, updateNavigationDto);
  }

  @Post('bulk-update')
  updateNavigations(@Body() updateNavigationDtoArray: UpdateNavigationDto[]) {
    return this.navigationService.updateNavigations(updateNavigationDtoArray);
  }

  @Post('bulk-delete')
  removeNavigations(@Body() ids: string[]) {
    return this.navigationService.removeNavigations(ids);
  }

}
