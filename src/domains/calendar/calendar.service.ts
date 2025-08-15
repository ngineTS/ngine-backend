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
              private calendarRepository: Repository<Calendar>) {}

  create(createCalendarDto: CreateCalendarDto) {
    return this.calendarRepository.save(createCalendarDto);
  }

  findAll() {
    return `This action returns all calendar`;
  }

  findOne(id: number) {
    return `This action returns a #${id} calendar`;
  }

  update(id: string, updateCalendarDto: UpdateCalendarDto) {
    return this.calendarRepository.update(id, updateCalendarDto);
  }

  remove(id: string) {
    return this.calendarRepository.delete(id);
  }

  async findCalendarEventsByNavigationId(navigationId: string) {
    return await this.calendarRepository.find({
      where: { navigationId: navigationId },
      relations: ['media']
    });
  }
}
