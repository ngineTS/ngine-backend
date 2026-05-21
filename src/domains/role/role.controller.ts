import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserId } from 'src/core/decorators/user.decorator';
import { NavigationTypeNameArray, Permission } from 'src/core/decorators/role.decorator';
import { RolesGuard } from 'src/core/guards/role.guard';
import { RoleValidatorService } from './role-validator.service';

@NavigationTypeNameArray(['role-management', 'user-management'])
@Controller('role')
export class RoleController {

  constructor(
    private readonly _roleService: RoleService,
    private readonly _roleValidatorService: RoleValidatorService
  ) { }

  @Permission('add')
  @UseGuards(RolesGuard)
  @Post()
  async create(
    @Body() createRoleDto: CreateRoleDto,
    @UserId() userId: string
  ) {
    await this._roleValidatorService.validInsertAction(createRoleDto);
    return this._roleService.create(createRoleDto, userId);
  }

  @Permission('view')
  @UseGuards(RolesGuard)
  @Get()
  findAllRoles() {
    return this._roleService.findAllRoles();
  }

  @Permission('view')
  @UseGuards(RolesGuard)
  @Get('rpn')
  findAllRolesWithNavigationPermissions() {
    return this._roleService.findAllRolesWithNavigationPermissions();
  }

  @Permission('edit')
  @UseGuards(RolesGuard)
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @UserId() userId: string
  ) {
    await this._roleValidatorService.validUpdateAction(updateRoleDto, id);
    return this._roleService.update(id, updateRoleDto, userId);
  }

  @Permission('delete')
  @UseGuards(RolesGuard)
  @Delete(':id')
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserId() userId: string
  ) {
    await this._roleValidatorService.validDeleteAction(id);
    return this._roleService.remove(id, userId);
  }
}
