import { Injectable, NotFoundException } from '@nestjs/common';
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

  /**
   * Save a calendar event.
   * @param createCalendarDto The calendar event to save.
   * @returns The calendar event saved.
   */
  create(createCalendarDto: CreateCalendarDto) {
    return this.calendarRepository.save(createCalendarDto);
  }

  /**
   * Update a calendar event.
   * Throw NotFoundError if no row affected.
   * @param id The id of the calendar event to update.
   * @param updateCalendarDto The event properties to update.
   * @returns An UpdateResult type object.
   */
  async update(id: string, updateCalendarDto: UpdateCalendarDto) {
    const updateResult = await this.calendarRepository.update(id, updateCalendarDto);
    
    if (updateResult.affected === 0) {
      throw new NotFoundException(`Id ${id} not found.`);
    }

    return updateResult;
  }

  /**
   * Delete a calendar event.
   * Throw NotFoundError if no row affected.
   * @param id The id of the calendar event to delete.
   * @returns A DeleteResult type object.
   */
  async remove(id: string) {
    const deleteResult = await this.calendarRepository.delete(id);

    if (deleteResult.affected === 0) {
      throw new NotFoundException(`id ${id} not found.`);
    }

    return deleteResult;
  }

  /**
   * Find calendar event for given navigation id.
   * @param navigationId The navigation id associated to the calendar.
   * @returns An array of calendar events.
   */
  async findCalendarEventsByNavigationId(navigationId: string) {
    return await this.calendarRepository.find({
      where: { navigationId: navigationId },
      relations: ['media']
    });
  }
}
