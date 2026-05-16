import { Test, TestingModule } from '@nestjs/testing';
import { ContainerStyleService } from './container-style.service';

describe('ContainerStyleService', () => {
  let service: ContainerStyleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContainerStyleService],
    }).compile();

    service = module.get<ContainerStyleService>(ContainerStyleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
