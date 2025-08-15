import { Test, TestingModule } from '@nestjs/testing';
import { CustomFormController } from './custom-form.controller';
import { CustomFormService } from './custom-form.service';

describe('CustomFormController', () => {
  let controller: CustomFormController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomFormController],
      providers: [CustomFormService],
    }).compile();

    controller = module.get<CustomFormController>(CustomFormController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
