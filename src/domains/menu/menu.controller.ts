import { Controller, Get, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
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
  ) {
    return this.menuService.createNavigationBar(navigationId, userId);
  }

  @Patch(':refId')
  updateStyleProperties(
    @Param('refId') refId: string,
    @Body() updateMenuDto: UpdateMenuDto
  ) {
    return this.menuService.updateStyleProperties(refId, updateMenuDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.menuService.remove(id);
  }
}
