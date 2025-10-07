import { Test, TestingModule } from '@nestjs/testing';
import { HeaderBarController } from './header-bar.controller';
import { HeaderBarService } from './header-bar.service';

describe('HeaderBarController', () => {
  let controller: HeaderBarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HeaderBarController],
      providers: [HeaderBarService],
    }).compile();

    controller = module.get<HeaderBarController>(HeaderBarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
