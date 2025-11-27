import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { Calendar } from './entities/calendar.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavigationModule } from '../navigation/navigation.module';

@Module({
  imports:[TypeOrmModule.forFeature([Calendar]), NavigationModule],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
