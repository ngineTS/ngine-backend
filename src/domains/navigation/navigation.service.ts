import { Injectable } from '@nestjs/common';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Navigation } from './entities/navigation.entity';
import { FindOptionsOrder, FindOptionsOrderValue, FindOptionsWhere, IsNull, Repository } from 'typeorm';

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
    const where: FindOptionsWhere<Navigation> = { 
      deletedDate: IsNull(),
      parentId: IsNull() 
    };
    this.generateNestedRelationsOrderAndFilters(4, relations, order, where);
    return await this.navigationRepository.find({
      relations: [...relations],
      where: where,
      order: order
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} navigation`;
  }

  async saveNavigation(createNavigationDto: CreateNavigationDto) {
    createNavigationDto["name"] = createNavigationDto["displayLabel"]?.toLowerCase()?.replace(/ /g, "-");
    createNavigationDto["createdBy"] = '00000000-0000-0000-0000-000000000000';
    createNavigationDto["createdDate"] = new Date();
    return await this.navigationRepository.save(createNavigationDto);
  }

  async saveNavigationOrders(updateOrderNavigationDtoArray: UpdateNavigationDto[]) {
    updateOrderNavigationDtoArray.forEach(element => {
      element["updatedBy"] = '00000000-0000-0000-0000-000000000000';
      element["updatedDate"] = new Date();
    });
    return await this.navigationRepository.save(updateOrderNavigationDtoArray);
  }

  async updateNavigation(id: string, updateNavigationDto: UpdateNavigationDto) {
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

  generateNestedRelationsOrderAndFilters(
    depth: number, 
    relations: Set<string>, 
    order: FindOptionsOrder<Navigation>, 
    where: FindOptionsWhere<Navigation>,
    base: string = ''
  ) {
    relations.add(base + 'navigationType');
    if(depth > 0) {
      relations.add(base + 'children');
      base = base + 'children.';
      order.children = { order: 'ASC'};
      where.children = { deletedDate: IsNull() }
      this.generateNestedRelationsOrderAndFilters(depth - 1, relations, order.children, where.children, base);
    }
  }



}
