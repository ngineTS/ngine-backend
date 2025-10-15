import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './auth.guard';


@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-in')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.emailAddress, signInDto.password);
  }

}
