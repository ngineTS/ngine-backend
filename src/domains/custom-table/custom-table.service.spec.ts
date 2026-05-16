import { Test, TestingModule } from '@nestjs/testing';
import { CustomTableService } from './custom-table.service';

describe('CustomTableService', () => {
  let service: CustomTableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomTableService],
    }).compile();

    service = module.get<CustomTableService>(CustomTableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
