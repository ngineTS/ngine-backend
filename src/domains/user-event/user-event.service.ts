import { Injectable } from '@nestjs/common';
import { CreateUserEventDto } from './dto/create-user-event.dto';
import { UpdateUserEventDto } from './dto/update-user-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEvent } from './entities/user-event.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserEventService {

  constructor(
    @InjectRepository(UserEvent)
    private _userEventRepository: Repository<UserEvent>
  ) { }
  
  async create(createUserEventDto: CreateUserEventDto, userId: string) {
    createUserEventDto['date'] = new Date();
    createUserEventDto['userId'] = userId;
    return await this._userEventRepository.save(createUserEventDto);
  }

  async getSessionCountByDay() {
    return await this._userEventRepository
      .createQueryBuilder("e")
      .select("to_char(e.date, 'YYYY-MM-DD')", "name")
      .addSelect("COUNT(DISTINCT e.sessionId)", "value")
      .groupBy("to_char(e.date, 'YYYY-MM-DD')")
      .orderBy("to_char(e.date, 'YYYY-MM-DD')", "ASC")
      .getRawMany();
  }

  async getMonthlyActiveUsers() {
    return await this._userEventRepository
      .createQueryBuilder("e")
      .select("to_char(e.date, 'YYYY-MM')", "name")
      .addSelect("COUNT(DISTINCT e.userId)", "value")
      .groupBy("to_char(e.date, 'YYYY-MM')")
      .orderBy("to_char(e.date, 'YYYY-MM')", "ASC")
      .getRawMany();
  }

  async getNumberOfVisitByUrl() {
    return await this._userEventRepository
      .createQueryBuilder('e')
      .select('url', 'name')
      .addSelect('COUNT("userId")', 'value')
      .groupBy('url')
      .orderBy('url', 'ASC')
      .getRawMany();
  }

}
