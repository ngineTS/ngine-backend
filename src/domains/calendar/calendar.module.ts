import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { Calendar } from './entities/calendar.entity';
import { Navigation } from 'src/domains/navigation/entities/navigation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavigationService } from 'src/domains/navigation/navigation.service';

@Module({
  imports:[TypeOrmModule.forFeature([Calendar, Navigation])],
  controllers: [CalendarController],
  providers: [CalendarService, NavigationService],
})
export class CalendarModule {}
