import { Test, TestingModule } from '@nestjs/testing';
import { NavigationTypeController } from './navigation_type.controller';
import { NavigationTypeService } from './navigation_type.service';

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
