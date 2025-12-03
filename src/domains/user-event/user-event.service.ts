import { Injectable } from '@nestjs/common';
import { CreateUserEventDto } from './dto/create-user-event.dto';
import { UpdateUserEventDto } from './dto/update-user-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEvent } from './entities/user-event.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserEventService {

  constructor(@InjectRepository(UserEvent)
              private _userEventRepository: Repository<UserEvent>) {}
  
  async create(createUserEventDto: CreateUserEventDto) {
    createUserEventDto['date'] = new Date();
    createUserEventDto['userId'] = '00000000-0000-0000-0000-000000000000';
    return await this._userEventRepository.save(createUserEventDto);
  }

  findAll() {
    return `This action returns all userEvent`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userEvent`;
  }

  update(id: number, updateUserEventDto: UpdateUserEventDto) {
    return `This action updates a #${id} userEvent`;
  }

  remove(id: number) {
    return `This action removes a #${id} userEvent`;
  }
}
