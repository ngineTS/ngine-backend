import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { UserId } from 'src/core/decorators/user.decorator';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('create-navigation-bar/:navigationId')
  createNavigationBar(
    @Param('navigationId') navigationId: string,
    @UserId() userId: string
  ) {
    return this.menuService.createNavigationBar(navigationId, userId);
  }

  @Patch(':id')
  updateStyleProperties(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.updateStyleProperties(id, updateMenuDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}
