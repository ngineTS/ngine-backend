import { Test, TestingModule } from '@nestjs/testing';
import { TypographyStyleService } from './typography-style.service';

describe('TypographyStyleService', () => {
  let service: TypographyStyleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypographyStyleService],
    }).compile();

    service = module.get<TypographyStyleService>(TypographyStyleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
