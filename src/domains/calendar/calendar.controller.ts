import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { RolesGuard } from 'src/core/guards/role.guard';
import { Feature, Permission } from 'src/core/decorators/role.decorator';

@Feature('calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Post()
  @Permission('add')
  @UseGuards(RolesGuard)
  create(@Body() createCalendarDto: CreateCalendarDto) {
    return this.calendarService.create(createCalendarDto);
  }
  
  @Get('navigation/:navigationId')
  @Permission('view')
  @UseGuards(RolesGuard)
  findCalendarEventsByNavigationId(@Param('navigationId', new ParseUUIDPipe()) navigationId: string) {
    return this.calendarService.findCalendarEventsByNavigationId(navigationId);
  }

  @Patch(':id')
  @Permission('edit')
  @UseGuards(RolesGuard)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateCalendarDto: UpdateCalendarDto
  ) {
    return this.calendarService.update(id, updateCalendarDto);
  }

  @Delete(':id')
  @Permission('delete')
  @UseGuards(RolesGuard)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.calendarService.remove(id);
  }
}
