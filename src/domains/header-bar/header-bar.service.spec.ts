import { Test, TestingModule } from '@nestjs/testing';
import { HeaderBarService } from './header-bar.service';

describe('HeaderBarService', () => {
  let service: HeaderBarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HeaderBarService],
    }).compile();

    service = module.get<HeaderBarService>(HeaderBarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
