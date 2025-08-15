import { Test, TestingModule } from '@nestjs/testing';
import { TableVizService } from './table-viz.service';

describe('TableVizService', () => {
  let service: TableVizService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TableVizService],
    }).compile();

    service = module.get<TableVizService>(TableVizService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
