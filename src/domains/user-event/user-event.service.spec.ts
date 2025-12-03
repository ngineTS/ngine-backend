import { Test, TestingModule } from '@nestjs/testing';
import { UserEventService } from './user-event.service';

describe('UserEventService', () => {
  let service: UserEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserEventService],
    }).compile();

    service = module.get<UserEventService>(UserEventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
