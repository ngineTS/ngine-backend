import { Test, TestingModule } from '@nestjs/testing';
import { ContainerLayoutService } from './container-layout.service';

describe('ContainerLayoutService', () => {
  let service: ContainerLayoutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContainerLayoutService],
    }).compile();

    service = module.get<ContainerLayoutService>(ContainerLayoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
