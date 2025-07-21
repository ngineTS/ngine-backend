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

  async saveNavigations(createNavigationDto: CreateNavigationDto) {
    console.log('navigations for save', createNavigationDto);
    createNavigationDto["name"] = createNavigationDto["displayLabel"]?.toLowerCase()?.replace(/ /g, "-");
    createNavigationDto["createdBy"] = '00000000-0000-0000-0000-000000000000';
    createNavigationDto["createdDate"] = new Date();
    return await this.navigationRepository.save(createNavigationDto);
  }

  async update(id: string, updateNavigationDto: UpdateNavigationDto) {
    updateNavigationDto["updatedBy"] = '00000000-0000-0000-0000-000000000000';
    updateNavigationDto["updatedDate"] = new Date();
    return await this.navigationRepository.update(id, updateNavigationDto);
  }

  remove(id: number) {
    return `This action removes a #${id} navigation`;
  }
}
