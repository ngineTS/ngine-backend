import { Test, TestingModule } from '@nestjs/testing';
import { ContainerStyleController } from './container-style.controller';
import { ContainerStyleService } from './container-style.service';

describe('ContainerStyleController', () => {
  let controller: ContainerStyleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContainerStyleController],
      providers: [ContainerStyleService],
    }).compile();

    controller = module.get<ContainerStyleController>(ContainerStyleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
