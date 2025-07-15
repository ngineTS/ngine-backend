import { Injectable } from '@nestjs/common';
import { CreateNavigationTypeDto } from './dto/create-navigation-type.dto';
import { UpdateNavigationTypeDto } from './dto/update-navigation-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { NavigationType } from './entities/navigation-type.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NavigationTypeService {

  constructor(@InjectRepository(NavigationType)
              private navigationTypeRepository: Repository<NavigationType>) {}

  create(createNavigationTypeDto: CreateNavigationTypeDto) {
    return 'This action adds a new navigationType';
  }

  async findAll() {
    return await this.navigationTypeRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} navigationType`;
  }

  update(id: number, updateNavigationTypeDto: UpdateNavigationTypeDto) {
    return `This action updates a #${id} navigationType`;
  }

  remove(id: number) {
    return `This action removes a #${id} navigationType`;
  }
}
