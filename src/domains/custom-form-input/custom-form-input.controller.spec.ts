import { Test, TestingModule } from '@nestjs/testing';
import { CustomFormInputController } from './custom-form-input.controller';
import { CustomFormInputService } from './custom-form-input.service';

describe('CustomFormController', () => {
  let controller: CustomFormInputController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomFormInputController],
      providers: [CustomFormInputService],
    }).compile();

    controller = module.get<CustomFormInputController>(CustomFormInputController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
