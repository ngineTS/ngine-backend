import { Controller, Get, Post, Body, Patch, Param, Request } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { UserId } from 'src/core/decorators/user.decorator';
import { Navigation } from './entities/navigation.entity';

@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Post()
  saveNavigation(
    @Body() createNavigationDto: CreateNavigationDto,
    @UserId() userId: string,
    @Request() req
  ) {
    return this.navigationService.saveNavigation(createNavigationDto, userId, req.user.userNavigationPermissions);
  }

  @Get()
  findNestedNavigations(@Request() req) {
    return this.navigationService.findNestedNavigations(req.user.sub);
  }

  @Get('flat')
  findAllNavigations(@Request() req) {
    return this.navigationService.findAllNavigations(req.user.userNavigationPermissions);
  }

  @Patch(':id')
  updateNavigation(
    @Param('id') id: string,
    @Body() updateNavigationDto: UpdateNavigationDto,
    @UserId() userId: string,
    @Request() req
  ) {
    return this.navigationService.updateNavigation(
      id,
      updateNavigationDto,
      userId,
      req.user.userNavigationPermissions
    );
  }

  @Post('bulk-update')
  updateNavigations(
    @Body() updateNavigationDtoArray: UpdateNavigationDto[],
    @UserId() userId: string,
    @Request() req
  ) {
    return this.navigationService.updateNavigations(
      updateNavigationDtoArray,
      userId,
      req.user.userNavigationPermissions
    );
  }

  @Post('delete')
  removeNavigation(
    @Body() navigation: Navigation,
    @UserId() userId: string,
    @Request() req
  ) {
    return this.navigationService.removeNavigation(navigation, userId, req.user.userNavigationPermissions);
  }

}
