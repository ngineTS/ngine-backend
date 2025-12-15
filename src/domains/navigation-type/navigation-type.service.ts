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

  async findAll() {
    return await this.navigationTypeRepository.find();
  }

}
