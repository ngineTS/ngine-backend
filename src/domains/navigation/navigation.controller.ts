import { Controller, Get, Post, Body, Patch, Param, Request } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { UserId } from 'src/core/decorators/user.decorator';

@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Post()
  saveNavigation(
    @Body() createNavigationDto: CreateNavigationDto,
    @UserId() userId: string
  ) {
    return this.navigationService.saveNavigation(createNavigationDto, userId);
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
  updateNavigation(
    @Param('id') id: string,
    @Body() updateNavigationDto: UpdateNavigationDto,
    @UserId() userId: string
  ) {
    return this.navigationService.updateNavigation(id, updateNavigationDto, userId);
  }

  @Post('bulk-update')
  updateNavigations(
    @Body() updateNavigationDtoArray: UpdateNavigationDto[],
    @UserId() userId: string
  ) {
    return this.navigationService.updateNavigations(updateNavigationDtoArray, userId);
  }

  @Post('bulk-delete')
  removeNavigations(
    @Body() ids: string[],
    @UserId() userId: string
  ) {
    return this.navigationService.removeNavigations(ids, userId);
  }

}
