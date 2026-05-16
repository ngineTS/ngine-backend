import { Controller, Post, Body, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './auth.guard';
import { Request } from 'express';


@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-in')
  signIn(@Body() signInDto: Record<string, string>) {
    return this.authService.signIn(signInDto.emailAddress, signInDto.password);
  }

  @Public()
  @Get('guest-sign-in')
  guestSignIn() {
    return this.authService.guestSignIn();
  }

  @Post('refresh')
  refresh(@Req() req: Request) {
    return this.authService.refresh(req);
  }
}
