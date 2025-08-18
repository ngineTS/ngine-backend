import { Test, TestingModule } from '@nestjs/testing';
import { CustomFormInputService } from './custom-form-input.service';

describe('CustomFormService', () => {
  let service: CustomFormInputService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomFormInputService],
    }).compile();

    service = module.get<CustomFormInputService>(CustomFormInputService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
