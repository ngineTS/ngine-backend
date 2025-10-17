import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './auth.guard';
import { Request, Response } from 'express';


@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-in')
  signIn(
    @Body() signInDto: Record<string, string>,
    @Res({ passthrough: true }) res: Response) {
    return this.authService.signIn(signInDto.emailAddress, signInDto.password, res);
  }

  @Post('refresh')
  refresh(@Req() req: Request) {
    return this.authService.refresh(req);
  }
}
