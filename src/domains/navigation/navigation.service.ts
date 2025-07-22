import { Injectable } from '@nestjs/common';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Navigation } from './entities/navigation.entity';
import { FindOptionsOrder, FindOptionsOrderValue, IsNull, Repository } from 'typeorm';

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
    const relations = new Set<string>();
    const order: FindOptionsOrder<Navigation> = { order: 'ASC' };
    this.generateNestedRelationsAndOrder(4, relations, order);
    return await this.navigationRepository.find({
      relations: [...relations],
      where: { parentId: IsNull() },
      order: order
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} navigation`;
  }

  async saveNavigations(createNavigationDto: CreateNavigationDto) {
    createNavigationDto["name"] = createNavigationDto["displayLabel"]?.toLowerCase()?.replace(/ /g, "-");
    createNavigationDto["createdBy"] = '00000000-0000-0000-0000-000000000000';
    createNavigationDto["createdDate"] = new Date();
    return await this.navigationRepository.save(createNavigationDto);
  }

  async saveNavigationOrders(updateOrderNavigationDto: any) {
    updateOrderNavigationDto["updatedBy"] = '00000000-0000-0000-0000-000000000000';
    updateOrderNavigationDto["updatedDate"] = new Date();
    return await this.navigationRepository.save(updateOrderNavigationDto);
  }

  async update(id: string, updateNavigationDto: UpdateNavigationDto) {
    updateNavigationDto["updatedBy"] = '00000000-0000-0000-0000-000000000000';
    updateNavigationDto["updatedDate"] = new Date();
    return await this.navigationRepository.update(id, updateNavigationDto);
  }

  async remove(id: string) {
    return await this.navigationRepository.update(id, {
      deletedBy: '00000000-0000-0000-0000-000000000000',
      deletedDate: new Date()
    });
  }

  generateNestedRelationsAndOrder(
    depth: number, 
    relations: Set<string>, 
    order: FindOptionsOrder<Navigation>, 
    base: string = ''
  ) {
    relations.add(base + 'navigationType');
    if(depth > 0) {
      relations.add(base + 'children');
      base = base + 'children.';
      order.children = { order: 'ASC'};
      this.generateNestedRelationsAndOrder(depth - 1, relations, order.children, base);
    }
  }



}
