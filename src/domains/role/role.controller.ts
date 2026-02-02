import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserId } from 'src/core/decorators/user.decorator';

/**
 * Currently, role controller permission required only all permission.
 * Validation is done in service file on method entrance.
 */
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(
    @Body() createRoleDto: CreateRoleDto,
    @UserId() userId: string
  ) {
    return this.roleService.create(createRoleDto, userId);
  }

  @Get()
  findAllRoles() {
    return this.roleService.findAllRoles();
  }

  @Get('rpn')
  findAllRolesWithNavigationPermissions() {
    return this.roleService.findAllRolesWithNavigationPermissions();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @UserId() userId: string
  ) {
    return this.roleService.update(id, updateRoleDto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @UserId() userId: string
  ) {
    return this.roleService.remove(id, userId);
  }
}
