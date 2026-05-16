import { Test, TestingModule } from '@nestjs/testing';
import { NavigationTypeController } from './navigation-type.controller';
import { NavigationTypeService } from './navigation-type.service';

describe('NavigationTypeController', () => {
  let controller: NavigationTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NavigationTypeController],
      providers: [NavigationTypeService],
    }).compile();

    controller = module.get<NavigationTypeController>(NavigationTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
