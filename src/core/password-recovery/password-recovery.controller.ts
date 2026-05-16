import { Controller, Get, Param } from '@nestjs/common';
import { PasswordRecoveryService } from './password-recovery.service';
import { Public } from 'src/core/auth/auth.guard';

@Controller('password-recovery')
export class PasswordRecoveryController {
  constructor(private readonly passwordRecoveryService: PasswordRecoveryService) {}

  @Public()
  @Get('forgot/:email')
  create(@Param('email') email: string) {
    return this.passwordRecoveryService.sendRecoveryLinkByEmail(email);
  }
}
