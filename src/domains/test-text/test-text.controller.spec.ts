import { Test, TestingModule } from '@nestjs/testing';
import { TestTextController } from './test-text.controller';
import { TestTextService } from './test-text.service';

describe('TestTextController', () => {
  let controller: TestTextController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestTextController],
      providers: [TestTextService],
    }).compile();

    controller = module.get<TestTextController>(TestTextController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
