import { Test, TestingModule } from '@nestjs/testing';
import { CustomFormService } from './custom-form.service';

describe('CustomFormService', () => {
  let service: CustomFormService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomFormService],
    }).compile();

    service = module.get<CustomFormService>(CustomFormService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
