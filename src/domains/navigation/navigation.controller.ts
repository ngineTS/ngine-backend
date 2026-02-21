import { Controller, Get, Post, Body, Patch, Param, ParseUUIDPipe } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { UserId } from 'src/core/decorators/user.decorator';
import { Navigation } from './entities/navigation.entity';
import { UserNavigationPermissions } from 'src/core/decorators/user-navigation-permissions.decorator';
import { NavigationPermissions } from 'src/core/models/navigation-permissions.interface';
import { UserEmail } from 'src/core/decorators/user-email.decorator';
import { NavigationValidatorService } from './navigation-validator.service';

@Controller('navigation')
export class NavigationController {
  
  constructor(
    private readonly _navigationService: NavigationService,
    private readonly _navigationValidatorService: NavigationValidatorService,
  ) {}

  @Post()
  async saveNavigation(
    @Body() createNavigationDto: CreateNavigationDto,
    @UserId() userId: string,
    @UserNavigationPermissions() userNavigationPermissions: NavigationPermissions
  ) {
    this._navigationValidatorService.validAddPermission(
      createNavigationDto,
      userNavigationPermissions
    );
    await this._navigationValidatorService.validNavigationDto(createNavigationDto);
    return this._navigationService.saveNavigation(
      createNavigationDto,
      userId,
    );
  }

  @Get()
  findNestedNavigations(
    @UserId() userId: string,
    @UserEmail() UserEmail: string,
  ) {
    return this._navigationService.findNestedNavigations(userId, UserEmail, true);
  }

  @Get('flat')
  findAllNavigations(@UserNavigationPermissions() userNavigationPermissions: NavigationPermissions) {
    return this._navigationService.findAllNavigations(userNavigationPermissions);
  }

  @Patch(':id')
  async updateNavigation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateNavigationDto: UpdateNavigationDto,
    @UserId() userId: string,
    @UserNavigationPermissions() userNavigationPermissions: NavigationPermissions
  ) {
    await this._navigationValidatorService.validEditPermission(
      id,
      updateNavigationDto,
      userNavigationPermissions
    );
    await this._navigationValidatorService.validNavigationDto(updateNavigationDto, id);
    return this._navigationService.updateNavigation(id, updateNavigationDto, userId);
  }

  @Post('bulk-update')
  updateNavigations(
    @Body() navigations: Array<Navigation>,
    @UserId() userId: string,
    @UserNavigationPermissions() userNavigationPermissions: NavigationPermissions
  ) {
    this._navigationValidatorService.validEditPermissionOnArrayOfNavigations(
      navigations,
      userNavigationPermissions
    );
    return this._navigationService.updateNavigations(navigations, userId);

  }

  @Post('delete')
  removeNavigation(
    @Body() navigation: Navigation,
    @UserId() userId: string,
    @UserNavigationPermissions() userNavigationPermissions: NavigationPermissions
  ) {
    this._navigationValidatorService.validDeletePermission(
      navigation,
      userNavigationPermissions
    );
    return this._navigationService.removeNavigation(navigation, userId);
  }

}
