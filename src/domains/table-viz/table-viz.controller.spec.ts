import { Test, TestingModule } from '@nestjs/testing';
import { TableVizController } from './table-viz.controller';
import { TableVizService } from './table-viz.service';

describe('TableVizController', () => {
  let controller: TableVizController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TableVizController],
      providers: [TableVizService],
    }).compile();

    controller = module.get<TableVizController>(TableVizController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
