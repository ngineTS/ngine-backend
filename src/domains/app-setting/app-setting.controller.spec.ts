import { Test, TestingModule } from '@nestjs/testing';
import { AppSettingController } from './app-setting.controller';
import { AppSettingService } from './app-setting.service';

describe('AppSettingController', () => {
  let controller: AppSettingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppSettingController],
      providers: [AppSettingService],
    }).compile();

    controller = module.get<AppSettingController>(AppSettingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
