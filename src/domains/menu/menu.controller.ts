import { Controller, Get, Body, Patch, Param, Delete, ParseUUIDPipe, Request } from '@nestjs/common';
import { MenuService } from './menu.service';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { UserId } from 'src/core/decorators/user.decorator';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('create-navigation-bar/:navigationId')
  createNavigationBar(
    @Param('navigationId', new ParseUUIDPipe()) navigationId: string,
    @UserId() userId: string,
    @Request() req
  ) {
    return this.menuService.createNavigationBar(
      navigationId,
      userId,
      req.user.userNavigationPermissions
    );
  }

  @Patch(':refId')
  updateStyleProperties(
    @Param('refId') refId: string,
    @Body() updateMenuDto: UpdateMenuDto,
    @Request() req
  ) {
    return this.menuService.updateStyleProperties(
      refId,
      updateMenuDto,
      req.user.userNavigationPermissions
    );
  }
}
