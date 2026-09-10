import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'src/core/auth/auth.guard';
import { UserId } from 'src/core/decorators/user.decorator';
import { NavigationTypeNameArray, Permission } from 'src/core/decorators/role.decorator';
import { RolesGuard } from 'src/core/guards/role.guard';

@Controller('user')
@NavigationTypeNameArray(['user-management'])
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  findCurrentUser(@UserId() userId: string) {
    return this.userService.findCurrentUser(userId);
  }

  @Permission('view')
  @UseGuards(RolesGuard)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Public()
  @Post('sign-up')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Public()
  @Post('password-change')
  changeUserPassword(@Body() passwordChangeDto: any){
    return this.userService.changeUserPassword(passwordChangeDto);
  }

  @Permission('edit')
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string, 
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Permission('delete')
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserId() userId: string
  ) {
    return this.userService.remove(id, userId);
  }
}
