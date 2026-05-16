import { Test, TestingModule } from '@nestjs/testing';
import { UserEventController } from './user-event.controller';
import { UserEventService } from './user-event.service';

describe('UserEventController', () => {
  let controller: UserEventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserEventController],
      providers: [UserEventService],
    }).compile();

    controller = module.get<UserEventController>(UserEventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
