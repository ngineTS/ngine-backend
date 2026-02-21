import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { RoleNavigationPermissionService } from './role-navigation-permission.service';
import { CreateRoleNavigationPermissionDto } from './dto/create-role-navigation-permission.dto';
import { UserId } from 'src/core/decorators/user.decorator';
import { NavigationTypeNameArray, Permission } from 'src/core/decorators/role.decorator';
import { RolesGuard } from 'src/core/guards/role.guard';
import { RoleNavigationPermissionValidatorService } from './role-navigation-permission-validator.service';

@NavigationTypeNameArray(['role-management'])
@Controller('role-navigation-permission')
export class RoleNavigationPermissionController {

  constructor(
    private readonly _roleNavigationPermissionService: RoleNavigationPermissionService,
    private readonly _roleNavigationPermissionValidatorService: RoleNavigationPermissionValidatorService
  ) {}

  @Permission('edit')
  @UseGuards(RolesGuard)
  @Post('bulk-save')
  create(
    @Body() createRoleNavigationPermissionDtoArray: Array<CreateRoleNavigationPermissionDto>,
    @UserId() userId: string
  ) {
    this._roleNavigationPermissionValidatorService.validRoleNavigationPermission(
      createRoleNavigationPermissionDtoArray
    );
    return this._roleNavigationPermissionService.saveRoleNavigationArray(
      createRoleNavigationPermissionDtoArray,
      userId
    );
  }
}
