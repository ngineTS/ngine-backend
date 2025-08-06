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
    let navigations = await this.navigationRepository.find({
      relations: [
        'children',
        'navigationType',
        'children.navigationType',
      ],
    });
    navigations = this.filterOutDeletedNavigations(navigations);
    return navigations;
  }

  async findNestedNavigations() {
    const relations = new Set<string>();
    const order: FindOptionsOrder<Navigation> = { order: 'ASC' };
    const where: FindOptionsWhere<Navigation> = { 
      deletedDate: IsNull(),
      parentId: IsNull() 
    };
    this.generateRelationsAndOrder(4, relations, order); //TO DO: Replace 4 by the exact depth wished
    let navigations = await this.navigationRepository.find({
      relations: [...relations],
      where: where,
      order: order
    });
    navigations.forEach(navigation => navigation.children = this.filterOutDeletedNavigations(navigation.children));
    return navigations;
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

  async updateNavigation(id: string, updateNavigationDto: UpdateNavigationDto) {
    updateNavigationDto["updatedBy"] = '00000000-0000-0000-0000-000000000000';
    updateNavigationDto["updatedDate"] = new Date();
    return await this.navigationRepository.update(id, updateNavigationDto);
  }

  async updateNavigations(updateNavigationDtoArray: UpdateNavigationDto[]) {
    updateNavigationDtoArray.forEach(element => {
      element["updatedBy"] = '00000000-0000-0000-0000-000000000000';
      element["updatedDate"] = new Date();
    });
    return await this.navigationRepository.save(updateNavigationDtoArray);
  }

  async removeNavigations(ids: string[]) {
    const recordsToDelete: Array<UpdateNavigationDto> = [];
    ids.forEach(id => 
      recordsToDelete.push({
        id: id,
        deletedBy: '00000000-0000-0000-0000-000000000000',
        deletedDate: new Date()
      })
    )
    return await this.navigationRepository.save(recordsToDelete);
  }

  generateRelationsAndOrder(
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
      this.generateRelationsAndOrder(depth - 1, relations, order.children, base);
    }
  }

  filterOutDeletedNavigations(navigations: Navigation[]) {
    for (let navigation of navigations) {
      if(navigation.children?.length > 0) {
        navigation.children = this.filterOutDeletedNavigations(navigation.children);
      }
    }
    return navigations.filter(obj => !obj.deletedDate);
  }

}
