import { Controller, Post, Body, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { UserRoleService } from './user-role.service';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UserId } from 'src/core/decorators/user.decorator';
import { NavigationTypeNameArray, Permission } from 'src/core/decorators/role.decorator';
import { RolesGuard } from 'src/core/guards/role.guard';

@NavigationTypeNameArray(['user-management'])
@Controller('user-role')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Permission('edit')
  @UseGuards(RolesGuard)
  @Post('bulk-save/:userId')
  bulkSaveUserRoles(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() createUserRoleDtoArray: Array<CreateUserRoleDto>,
    @UserId() createdBy: string
  ) {
    return this.userRoleService.bulkSaveUserRoles(userId, createUserRoleDtoArray, createdBy);
  }
}
