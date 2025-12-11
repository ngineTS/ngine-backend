import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserEventService } from './user-event.service';
import { CreateUserEventDto } from './dto/create-user-event.dto';
import { UpdateUserEventDto } from './dto/update-user-event.dto';

@Controller('user-event')
export class UserEventController {
  constructor(private readonly userEventService: UserEventService) {}

  @Post()
  create(@Body() createUserEventDto: CreateUserEventDto) {
    return this.userEventService.create(createUserEventDto);
  }

  @Get('session-count-by-day')
  getSessionCountByDay() {
    return this.userEventService.getSessionCountByDay();
  }

  @Get('mau')
  getMonthlyActiveUsers() {
    return this.userEventService.getMonthlyActiveUsers();
  }

  @Get('visit-by-url')
  getNumberOfVisitByUrl() {
    return this.userEventService.getNumberOfVisitByUrl();
  }

}
