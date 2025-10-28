import { Injectable } from '@nestjs/common';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Navigation } from './entities/navigation.entity';
import { FindOptionsOrder, FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { RoleNavigationPermission } from '../role-navigation-permission/entities/role-navigation-permission.entity';

@Injectable()
export class NavigationService {

  constructor(@InjectRepository(Navigation)
              private _navigationRepository: Repository<Navigation>,
              @InjectRepository(User)
              private _userRepository: Repository<User>) {}

  async findAllNavigations() {
    let navigations = await this._navigationRepository.find({
      relations: [
        'children',
        'navigationType',
        'children.navigationType',
      ],
      order: {
        displayLabel: 'ASC'
      }
    });
    navigations = this.filterOutDeletedNavigations(navigations);
    return navigations;
  }

  /**
   * Load Nested navigations and their permissions filter by user permissions.
   * @param userId The user id from the request.
   * @returns A nested navigations object.
   */
  async findNestedNavigations(userId: string) {
    const userRoleNavigationPermissionsFormatted = await this.getUserRoleNavigationPermissionsFormatted(userId);
    console.log('FINAL', userRoleNavigationPermissionsFormatted);

    const relations = new Set<string>();
    const order: FindOptionsOrder<Navigation> = { order: 'ASC' };
    const where: FindOptionsWhere<Navigation> = { 
      deletedDate: IsNull(),
      parentId: IsNull() 
    };
    this.generateRelationsAndOrder(4, relations, order); //TO DO: Replace 4 by the exact depth wished
    let navigations = await this._navigationRepository.find({
      relations: [...relations],
      where: where,
      order: order
    });
    navigations = this.filterOutDeletedNavigations(navigations);
    return navigations;
  }

  findOne(id: number) {
    return `This action returns a #${id} navigation`;
  }

  async saveNavigation(createNavigationDto: CreateNavigationDto) {
    createNavigationDto["name"] = createNavigationDto["displayLabel"]?.toLowerCase()?.replace(/ /g, "-");
    createNavigationDto["createdBy"] = '00000000-0000-0000-0000-000000000000';
    createNavigationDto["createdDate"] = new Date();
    return await this._navigationRepository.save(createNavigationDto);
  }

  async updateNavigation(id: string, updateNavigationDto: UpdateNavigationDto) {
    updateNavigationDto["updatedBy"] = '00000000-0000-0000-0000-000000000000';
    updateNavigationDto["updatedDate"] = new Date();
    return await this._navigationRepository.update(id, updateNavigationDto);
  }

  async updateNavigations(updateNavigationDtoArray: UpdateNavigationDto[]) {
    updateNavigationDtoArray.forEach(element => {
      element["updatedBy"] = '00000000-0000-0000-0000-000000000000';
      element["updatedDate"] = new Date();
    });
    return await this._navigationRepository.save(updateNavigationDtoArray);
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
    return await this._navigationRepository.save(recordsToDelete);
  }

  generateRelationsAndOrder(
    depth: number, 
    relations: Set<string>, 
    order: FindOptionsOrder<Navigation>, 
    base: string = ''
  ) {
    relations.add(base + 'navigationType');
    relations.add(base + 'headerBar');
    if(depth > 0) {
      relations.add(base + 'children');
      base = base + 'children.';
      order.children = { order: 'ASC'};
      this.generateRelationsAndOrder(depth - 1, relations, order.children, base);
    }
  }

  filterOutDeletedNavigations(navigations: Navigation[]) {
    for (let navigation of navigations) {
      if (navigation.headerBar?.deletedBy) {
        navigation.headerBar = null;
      }
      if (navigation.children?.length > 0) {
        navigation.children = this.filterOutDeletedNavigations(navigation.children);
      }
    }
    return navigations.filter(obj => !obj.deletedDate);
  }

  async getUserRoleNavigationPermissionsFormatted(userId: string): Promise<Array<RoleNavigationPermission>> {
    console.log(userId);
    /* get user roles */
    const userWithRoles = await this._userRepository.findOne({
      relations: [
        'userRoles',
        'userRoles.role',
        'userRoles.role.roleNavigationPermissions',
        'userRoles.role.roleNavigationPermissions.navigation',
        'userRoles.role.roleNavigationPermissions.permission',
      ],
      where: {id: userId}
    });
    /* exclude deleted user roles */
    if (userWithRoles) {
      userWithRoles.userRoles = userWithRoles.userRoles
        .filter(obj => !obj.deletedDate && !obj.role.deletedDate);
    }
    /* exclude deleted user role navigation permissions */
    userWithRoles?.userRoles.forEach(userRole => {
      userRole.role.roleNavigationPermissions = userRole.role.roleNavigationPermissions
        .filter(obj => !obj.deletedDate && !obj.navigation.deletedDate && !obj.permission.deletedDate);
    })
    /* retrieve userRoleNavigationPermissions only */
    const userRoleNavigationPermissions: RoleNavigationPermission[] = [];
    userWithRoles?.userRoles.forEach(userRole => {
      userRole.role.roleNavigationPermissions.forEach(rnp => userRoleNavigationPermissions.push(rnp));
    })
    /* group roleNavigationPermissions by navigationId */
    const userRoleNavigationPermissionsByNavigationId = userRoleNavigationPermissions.reduce((acc, item) => {
      (acc[item.navigationId] ||= []).push(item);
      return acc;
    }, {});
    /* if multiple roleNavigationPermissions by navigationId then keep only the one with highest priority */
    const priorityUserRoleNavigationPermissionByNavigationId = Object.fromEntries(
      Object.entries<RoleNavigationPermission[]>(userRoleNavigationPermissionsByNavigationId)
        .map(([id, items]) => {
          const lowest = items.reduce((min, item) =>
            item.permission.priority < min.permission.priority ? item : min
          );
          return [id, lowest];
        })
    );
    /* create final array of user roleNavigationPermissions */
    const userRoleNavigationPermissionsFormatted: RoleNavigationPermission[] = [];
     for (const [key, value] of Object.entries(priorityUserRoleNavigationPermissionByNavigationId)) {
      userRoleNavigationPermissionsFormatted.push(value);
    }
    return userRoleNavigationPermissionsFormatted;
  }

}
