import { Test, TestingModule } from '@nestjs/testing';
import { TypographyStyleController } from './typography-style.controller';
import { TypographyStyleService } from './typography-style.service';

describe('TypographyStyleController', () => {
  let controller: TypographyStyleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypographyStyleController],
      providers: [TypographyStyleService],
    }).compile();

    controller = module.get<TypographyStyleController>(TypographyStyleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
