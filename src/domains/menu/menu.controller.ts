import { Controller, Get, Body, Patch, Param, ParseUUIDPipe } from '@nestjs/common';
import { MenuService } from './menu.service';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { UserId } from 'src/core/decorators/user.decorator';
import { MenuValidatorService } from './menu-validator.service';
import { UserNavigationPermissions } from 'src/core/decorators/user-navigation-permissions.decorator';
import { NavigationPermissions } from 'src/core/models/navigation-permissions.interface';

@Controller('menu')
export class MenuController {

  constructor(
    private readonly _menuService: MenuService,
    private readonly _menuValidatorService: MenuValidatorService, 
  ) {}

  @Get('create-navigation-bar/:navigationId/:navigationBarType')
  async createNavigationBar(
    @Param('navigationId', new ParseUUIDPipe()) navigationId: string,
    @Param('navigationBarType') navigationBarType: 'vertical' | 'horizontal',
    @UserId() userId: string,
    @UserNavigationPermissions() userNavigationPermissions: NavigationPermissions
  ) {
    const navigation = await this._menuValidatorService.validPermissionToCreateNavigationBar(navigationId, userNavigationPermissions);
    return this._menuService.createNavigationBar(navigation, userId, navigationBarType);
  }

   // /!\ This API is also used to modify navigation style properties, not only menu ones.
  @Patch(':refId')
  async updateStyleProperties(
    @Param('refId') refId: string,
    @Body() updateMenuDto: UpdateMenuDto,
    @UserNavigationPermissions() userNavigationPermissions: NavigationPermissions
  ) {
    await this._menuValidatorService.validPermissionToUpdateStyle(refId, userNavigationPermissions);
    return this._menuService.updateStyleProperties(refId, updateMenuDto);
  }
}
