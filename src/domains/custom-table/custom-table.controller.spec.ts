import { Test, TestingModule } from '@nestjs/testing';
import { CustomTableController } from './custom-table.controller';
import { CustomTableService } from './custom-table.service';

describe('CustomTableController', () => {
  let controller: CustomTableController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomTableController],
      providers: [CustomTableService],
    }).compile();

    controller = module.get<CustomTableController>(CustomTableController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
