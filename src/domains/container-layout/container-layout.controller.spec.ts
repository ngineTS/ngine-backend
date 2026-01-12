import { Test, TestingModule } from '@nestjs/testing';
import { ContainerLayoutController } from './container-layout.controller';
import { ContainerLayoutService } from './container-layout.service';

describe('ContainerLayoutController', () => {
  let controller: ContainerLayoutController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContainerLayoutController],
      providers: [ContainerLayoutService],
    }).compile();

    controller = module.get<ContainerLayoutController>(ContainerLayoutController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
