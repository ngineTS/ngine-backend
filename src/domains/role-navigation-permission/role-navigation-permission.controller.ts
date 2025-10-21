import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoleNavigationPermissionService } from './role-navigation-permission.service';
import { CreateRoleNavigationPermissionDto } from './dto/create-role-navigation-permission.dto';
import { UpdateRoleNavigationPermissionDto } from './dto/update-role-navigation-permission.dto';

@Controller('role-navigation-permission')
export class RoleNavigationPermissionController {
  constructor(private readonly roleNavigationPermissionService: RoleNavigationPermissionService) {}

  @Post()
  create(@Body() createRoleNavigationPermissionDto: CreateRoleNavigationPermissionDto) {
    return this.roleNavigationPermissionService.create(createRoleNavigationPermissionDto);
  }

  @Get()
  findAll() {
    return this.roleNavigationPermissionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleNavigationPermissionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleNavigationPermissionDto: UpdateRoleNavigationPermissionDto) {
    return this.roleNavigationPermissionService.update(+id, updateRoleNavigationPermissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roleNavigationPermissionService.remove(+id);
  }
}
