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

  @Get()
  findAll() {
    return this.userEventService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userEventService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserEventDto: UpdateUserEventDto) {
    return this.userEventService.update(+id, updateUserEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userEventService.remove(+id);
  }
}
