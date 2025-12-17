import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoleNavigationPermissionService } from './role-navigation-permission.service';
import { CreateRoleNavigationPermissionDto } from './dto/create-role-navigation-permission.dto';
import { UpdateRoleNavigationPermissionDto } from './dto/update-role-navigation-permission.dto';
import { UserId } from 'src/core/decorators/user.decorator';

@Controller('role-navigation-permission')
export class RoleNavigationPermissionController {
  constructor(private readonly roleNavigationPermissionService: RoleNavigationPermissionService) {}

  @Post('bulk-save')
  create(
    @Body() createRoleNavigationPermissionDtoArray: Array<CreateRoleNavigationPermissionDto>,
    @UserId() userId: string
  ) {
    return this.roleNavigationPermissionService.saveRoleNavigationArray(
      createRoleNavigationPermissionDtoArray,
      userId
    );
  }

  @Post('bulk-delete')
  remove(
    @Body() ids: string[],
    @UserId() userId: string
  ) {
    return this.roleNavigationPermissionService.bulkRemove(ids, userId);
  }
}
