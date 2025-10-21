import { Test, TestingModule } from '@nestjs/testing';
import { PasswordRecoveryController } from './password-recovery.controller';
import { PasswordRecoveryService } from './password-recovery.service';

describe('PasswordRecoveryController', () => {
  let controller: PasswordRecoveryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PasswordRecoveryController],
      providers: [PasswordRecoveryService],
    }).compile();

    controller = module.get<PasswordRecoveryController>(PasswordRecoveryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
