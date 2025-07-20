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

  async saveNavigations(createNavigationDto: CreateNavigationDto) {
    console.log('navigations for save', createNavigationDto);
    createNavigationDto["name"] = createNavigationDto["displayLabel"]?.toLowerCase()?.replace(/ /g, "-");
    return await this.navigationRepository.save(createNavigationDto);
  }

  async findAllNavigations() {
    return await this.navigationRepository.find({
      relations: [
        'children',
        'navigationType',
        'children.navigationType'
      ]
    });
  }

  async findNestedNavigations() {
    return await this.navigationRepository.find({
      relations: [
        'navigationType',
        'children',
        'children.navigationType',
        'children.children',
        'children.children.navigationType',
      ],
      where: { parentId: IsNull() },
      order: { 
        order: 'ASC', children: { 
          order: 'ASC', children: { 
            order: 'ASC' 
          } 
        } 
      }
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
