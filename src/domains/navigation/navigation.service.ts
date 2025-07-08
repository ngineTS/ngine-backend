import { Injectable } from '@nestjs/common';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Navigation } from './entities/navigation.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class NavigationService {

  constructor(@InjectRepository(Navigation)
              private navigationRepository: Repository<Navigation>) {}

  create(createNavigationDto: CreateNavigationDto) {
    return 'This action adds a new navigation';
  }

  async findAll() {
    return await this.navigationRepository.find({
      where: { parentId: IsNull() },
      relations: [
        'navigationType',
        'children',
        'children.navigationType'
      ]
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} navigation`;
  }

  update(id: number, updateNavigationDto: UpdateNavigationDto) {
    return `This action updates a #${id} navigation`;
  }

  remove(id: number) {
    return `This action removes a #${id} navigation`;
  }
}
