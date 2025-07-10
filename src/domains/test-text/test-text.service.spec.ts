import { Test, TestingModule } from '@nestjs/testing';
import { TestTextService } from './test-text.service';

describe('TestTextService', () => {
  let service: TestTextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestTextService],
    }).compile();

    service = module.get<TestTextService>(TestTextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
