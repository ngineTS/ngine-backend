import { Controller, Get, Post, Body, Patch, Param, Delete, Request, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserId } from 'src/core/decorators/user.decorator';
import { Feature, NavigationTypeName, Permission } from 'src/core/decorators/role.decorator';
import { RolesGuard } from 'src/core/guards/role.guard';

@Feature('Role')
@NavigationTypeName('role-management')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Permission('add')
  @UseGuards(RolesGuard)
  @Post()
  create(
    @Body() createRoleDto: CreateRoleDto,
    @UserId() userId: string
  ) {
    return this.roleService.create(createRoleDto, userId);
  }

  @Permission('view')
  @UseGuards(RolesGuard)
  @Get()
  findAllRoles() {
    return this.roleService.findAllRoles();
  }

  @Permission('view')
  @UseGuards(RolesGuard)
  @Get('rpn')
  findAllRolesWithNavigationPermissions() {
    return this.roleService.findAllRolesWithNavigationPermissions();
  }

  @Permission('edit')
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @UserId() userId: string
  ) {
    return this.roleService.update(id, updateRoleDto, userId);
  }

  @Permission('delete')
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserId() userId: string
  ) {
    return this.roleService.remove(id, userId);
  }
}
