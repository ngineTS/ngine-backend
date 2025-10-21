import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'src/core/auth/auth.guard';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('sign-up')
  create(
    @Body() createUserDto: CreateUserDto,
    @Res( {passthrough: true }) res: Response) {
    return this.userService.createUser(createUserDto, res);
  }

  @Public()
  @Post('password-change')
  changeUserPassword(@Body() passwordChangeDto: any){
    return this.userService.changeUserPassword(passwordChangeDto);
  }

  @Get()
  findUserData(@Request() req) {
    return this.userService.findUserData(req.user.sub);
  }

  @Public()
  @Get('email-address/:emailAddress')
  doesEmailAddressAlreadyExists(@Param('emailAddress') emailAddress: string){
    return this.userService.doesEmailAddressAlreadyExists(emailAddress);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
