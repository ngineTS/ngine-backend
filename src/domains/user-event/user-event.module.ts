import { Module } from '@nestjs/common';
import { UserEventService } from './user-event.service';
import { UserEventController } from './user-event.controller';
import { UserEvent } from './entities/user-event.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([UserEvent])],
  controllers: [UserEventController],
  providers: [UserEventService],
})
export class UserEventModule {}
