import { Controller, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { UserRoleService } from './user-role.service';
import { CreateUserRoleDto } from './dto/create-user-role.dto';
import { UserId } from 'src/core/decorators/user.decorator';

@Controller('user-role')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Post('bulk-save/:userId')
  bulkSaveUserRoles(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() createUserRoleDtoArray: Array<CreateUserRoleDto>,
    @UserId() createdBy: string
  ) {
    return this.userRoleService.bulkSaveUserRoles(userId, createUserRoleDtoArray, createdBy);
  }
}
