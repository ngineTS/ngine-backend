import { Test, TestingModule } from '@nestjs/testing';
import { NavigationTypeService } from './navigation-type.service';

describe('NavigationTypeService', () => {
  let service: NavigationTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NavigationTypeService],
    }).compile();

    service = module.get<NavigationTypeService>(NavigationTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
