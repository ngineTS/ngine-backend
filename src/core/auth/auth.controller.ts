import { Controller, Post, Body, Req } from '@nestjs/common';
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

  @Post('refresh')
  refresh(@Req() req: Request) {
    return this.authService.refresh(req);
  }
}
