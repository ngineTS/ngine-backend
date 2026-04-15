import { Test, TestingModule } from '@nestjs/testing';
import { AppSettingService } from './app-setting.service';

describe('AppSettingService', () => {
  let service: AppSettingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppSettingService],
    }).compile();

    service = module.get<AppSettingService>(AppSettingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
