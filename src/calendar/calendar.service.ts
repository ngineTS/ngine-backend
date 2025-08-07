import { Injectable } from '@nestjs/common';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Calendar } from './entities/calendar.entity';
import { NavigationService } from 'src/domains/navigation/navigation.service';

@Injectable()
export class CalendarService {

  constructor(@InjectRepository(Calendar)
              private calendarRepository: Repository<Calendar>,
              private navigationService: NavigationService) {}

  create(createCalendarDto: CreateCalendarDto) {
    console.log(createCalendarDto);
    return this.calendarRepository.save(createCalendarDto);
  }

  findAll() {
    return `This action returns all calendar`;
  }

  findOne(id: number) {
    return `This action returns a #${id} calendar`;
  }

  update(id: string, updateCalendarDto: UpdateCalendarDto) {
    console.log(updateCalendarDto);
    return this.calendarRepository.update(id, updateCalendarDto);
  }

  remove(id: number) {
    return `This action removes a #${id} calendar`;
  }
}
