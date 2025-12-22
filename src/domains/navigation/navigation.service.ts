import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Navigation } from './entities/navigation.entity';
import { FindOptionsOrder, FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { RoleNavigationPermission } from '../role-navigation-permission/entities/role-navigation-permission.entity';
import { Permission } from '../permission/entities/permission.entity';
import { NavigationType } from '../navigation-type/entities/navigation-type.entity';
import { HeaderBar } from '../header-bar/entities/header-bar.entity';

@Injectable()
export class NavigationService {

  constructor(@InjectRepository(Navigation)
              private _navigationRepository: Repository<Navigation>,
              @InjectRepository(NavigationType)
              private _navigationTypeRepository: Repository<NavigationType>,
              @InjectRepository(HeaderBar)
              private _headerBarRepository: Repository<HeaderBar>,
              @InjectRepository(User)
              private _userRepository: Repository<User>) {}

  /**
   * Find all flat navigations not deleted and their first level of children.
   * @returns The array of navigations.
   */
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
   * Load Nested navigations filtered by user permissions.
   * @param userId The user id from the request.
   * @returns A nested navigations object.
   */
  async findNestedNavigations(userId: string) {
    const userRoleNavigationPermissionsFormatted = await this.getUserRoleNavigationPermissionsFormatted(userId);
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
    navigations.forEach(navigation => this.setUpUserNavigationPermission(
      navigation,
      userRoleNavigationPermissionsFormatted
    ));
    navigations = this.filterOutDeletedNavigations(navigations, true);

    return navigations;
  }

  /**
   * Generate navigation relations until given depth.
   * @param depth The number of nested levels.
   * @param relations The existing set of relations.
   * @param order The existing TypeORM order property.
   * @param base The relation base.
   */
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
      order.children = { order: 'ASC' };
      this.generateRelationsAndOrder(depth - 1, relations, order.children, base);
    }
  }

  /**
   * Filter out soft deleted navigations in the given navigation array.
   * If 'filterOutNavigationWithoutPermission' is true - filter out also navigation without permissions.
   * @param navigations The navigations to filter.
   * @param filterOutNavigationWithoutPermission A boolean specifying if we want also to exclude the navigation without permission.
   * @returns The array of navigations filtered.
   */
  filterOutDeletedNavigations(navigations: Navigation[], filterOutNavigationWithoutPermission = false) {
    for (let navigation of navigations) {
      if (navigation.headerBar?.deletedBy) {
        navigation.headerBar = null;
      }
      if (navigation.children?.length > 0) {
        navigation.children = this.filterOutDeletedNavigations(navigation.children, filterOutNavigationWithoutPermission);
      }
    }
    return navigations.filter(navigation => {
      if (filterOutNavigationWithoutPermission) {
        return !navigation.deletedDate && navigation['permissionName']
      }
      else {
        return !navigation.deletedDate
      }
    });
  }

  /**
   * Format user roleNavigationPermissions.
   * 
   * If a user is assigned to multiple roles which share the same navigations
   * then we keep only the navigations with highest priviledge.
   * @param userId the id of the user.
   * @returns The user roleNavigationPermissions formatted.
   * 
   * TODO: Rework to something more fluent and performant.
   */
  async getUserRoleNavigationPermissionsFormatted(userId: string): Promise<Array<RoleNavigationPermission>> {
    /* get user roles */
    const userWithRoles = await this._userRepository.findOne({
      relations: [
        'userRoles',
        'userRoles.role',
        'userRoles.role.roleNavigationPermissions',
        'userRoles.role.roleNavigationPermissions.navigation',
        'userRoles.role.roleNavigationPermissions.permission',
      ],
      where: {
        id: userId,
        deletedDate: IsNull(),
      }
    });
    /* exclude deleted user roles */
    if (userWithRoles) {
      userWithRoles.userRoles = userWithRoles.userRoles
        .filter(obj => !obj.deletedDate && !obj.role.deletedDate);
    }
    /* exclude deleted user role navigation permissions */
    userWithRoles?.userRoles.forEach(userRole => {
      userRole.role.roleNavigationPermissions = userRole.role.roleNavigationPermissions
        .filter(obj => !obj.deletedDate && !obj.navigation?.deletedDate && !obj.permission.deletedDate);
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
    /* if multiple roleNavigationPermissions by navigationId then keep only the one with highest permission */
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

  /**
   * Set up user navigation permission based on below rules then repeat process for children.
   * 
   * - Case 1: Navigation permission found but parent permission is higher - navigation inherits parent navigation permission.
   * - Case 2: Navigation permission found and it is higher than parent one - keep navigation permission.
   * - Case 3: Navigation permission found and parent has no permission - assign 'Can view' to parent navigation.
   * - Case 4: No Navigation permission found but parent navigation permission found - navigation inherits parent navigation permission.
   * 
   * @param navigation The navigation to add "permissionName" prop.
   * @param userRoleNavigationPermissions The array of user roleNavigationPermissions.
   * @param parentNavigation The parent navigation.
   * @param parentNavigationPermission The parent navigation permission.
   */
  setUpUserNavigationPermission(
    navigation: Navigation,
    userRoleNavigationPermissions: RoleNavigationPermission[],
    parentNavigation?: Navigation,
    parentNavigationPermission?: Permission
  ) {
    /* get current navigation permission */
    let navigationPermission = userRoleNavigationPermissions.find(obj => obj.navigationId === navigation.id)?.permission;
    /* check if 'All navigations' permission exists and assign it to navigation if it is higher than navigation permission */
    let allNavigationsPermission = userRoleNavigationPermissions.find(obj => obj.navigationId === '00000000-0000-0000-0000-000000000000')?.permission;
    if (allNavigationsPermission) {
      if (!navigationPermission || allNavigationsPermission.priority < navigationPermission.priority) {
        navigationPermission = allNavigationsPermission;
      }
    }

    if (navigationPermission) {
      if (parentNavigationPermission) {
        /* Case 1 */
        if (navigationPermission.priority < parentNavigationPermission.priority) {
          navigation['permissionName'] = navigationPermission.name;
        }
        /* Case 2 */
        else {
          navigation['permissionName'] = parentNavigationPermission.name;
          navigationPermission = parentNavigationPermission;
        }
      }
      /* Case 3 */
      else {
        navigation['permissionName'] = navigationPermission.name;
        if (parentNavigation) {
          parentNavigation['permissionName'] = 'Can view';
        }
      }
    }
    /* Case 4 */
    else {
      if (parentNavigationPermission) {
        navigation['permissionName'] = parentNavigationPermission?.name;
        navigationPermission = parentNavigationPermission;
      }
    }

    /* repeat process to children */
    for (let child of navigation.children) { 
      this.setUpUserNavigationPermission(
        child,
        userRoleNavigationPermissions,
        navigation,
        navigationPermission
      );
    } 
  }

  /**
   * Save navigation.
   * 
   * If sister navigation with same name exists then throw BadRequest error.
   * 
   * If navigation is header and doesn't have sister (i.e first header)
   * then create header bar record associated to parent navigation (inherit config from parent header bar).
   * 
   * @param createNavigationDto The navigation to save.
   * @returns The navigation saved.
   */
  async saveNavigation(
    createNavigationDto: CreateNavigationDto,
    userId: string
  ): Promise<Navigation> {
    createNavigationDto["name"] = createNavigationDto["displayLabel"]?.toLowerCase()?.replace(/ /g, "-");

    const sisterNavigations = await this._navigationRepository.find({
      where: { 
        parentId: createNavigationDto["parentId"],
        deletedDate: IsNull()
      }
    });
  
    if (sisterNavigations?.find(navigation => navigation.name ===  createNavigationDto["name"])) {
      throw new BadRequestException('This name already exists');
    }

    //if parentId null no need to create header bar because main header bar already created.
    if (
      createNavigationDto["parentId"]
      && (!sisterNavigations || sisterNavigations.length === 0)
    ) {
      const headerNavigationType = await this._navigationTypeRepository.findOne({
        where: { name: 'header'}
      });
      if (createNavigationDto["navigationTypeId"] === headerNavigationType?.id) {
        await this.inheritParentHeaderBarConfig(createNavigationDto["parentId"], userId);
      }
    }

    createNavigationDto["createdBy"] = userId;
    createNavigationDto["createdDate"] = new Date();
    createNavigationDto["updatedBy"] = userId;
    createNavigationDto["updatedDate"] = new Date();
    return await this._navigationRepository.save(createNavigationDto);
  }

  /**
   * Update navigation properties.
   * 
   * If parentId has changed:
   * if navigation is header and doesn't have sister (i.e first header) 
   * then create header bar record associated to parent navigation (inherit config from parent header bar).
   * 
   * @param id The navigation id.
   * @param updateNavigationDto The navigation properties to update.
   * @returns An UpdateResponse type object.
   */
  async updateNavigation(
    id: string,
    updateNavigationDto: UpdateNavigationDto,
    userId: string
  ) {
    updateNavigationDto["updatedBy"] = userId;
    updateNavigationDto["updatedDate"] = new Date();
    
    if (updateNavigationDto["parentId"]) {
      const navigation = await this._navigationRepository.findOne({
        where: {id: id},
        relations: ['navigationType']
      });
      if (navigation?.navigationType.name === 'header') {
        const sisterNavigations = await this._navigationRepository.find({
          where: { 
            parentId: updateNavigationDto["parentId"],
            deletedDate: IsNull()
          }  
        });
        if (!sisterNavigations || sisterNavigations.length === 0) {
          await this.inheritParentHeaderBarConfig(updateNavigationDto["parentId"], userId);
        }
      }
    }

    return await this._navigationRepository.update(id, updateNavigationDto);
  }

  /**
   * Update Array of navigations.
   * @param updateNavigationDtoArray The array of navigations.
   * @returns The array of navigations saved.
   */
  async updateNavigations(updateNavigationDtoArray: UpdateNavigationDto[], userId: string) {
    updateNavigationDtoArray.forEach(element => {
      element["updatedBy"] = userId;
      element["updatedDate"] = new Date();
    });
    return await this._navigationRepository.save(updateNavigationDtoArray);
  }

  /**
   * Soft delete array of navigations.
   * @param ids The navigation ids array to soft delete.
   * @returns The Array of navigation that have been soft deleted.
   */
  async removeNavigations(ids: string[], userId: string) {
    const recordsToDelete: Array<UpdateNavigationDto> = [];
    ids.forEach(id => 
      recordsToDelete.push({
        id: id,
        deletedBy: userId,
        deletedDate: new Date()
      })
    )
    return await this._navigationRepository.save(recordsToDelete);
  }

  /**
   * Get the parent header bar configuration and create header bar for given navigation.
   * @param navigationId The navigationId which we want to create a header bar.
   */
  async inheritParentHeaderBarConfig(navigationId: string, userId: string) {
    const navigation = await this._navigationRepository.findOne({
      where: {id: navigationId}
    });

    const parentHeaderBar = await this._headerBarRepository.findOne({
      where: { 
        navigationId: navigation?.parentId ?? IsNull(),
        deletedDate: IsNull()
      }
    });

    const { id, imageName, ...headerBarPayload } = parentHeaderBar!;
    headerBarPayload.navigationId = navigationId;
    headerBarPayload.createdBy = userId;
    headerBarPayload.createdDate = new Date();
    headerBarPayload.updatedBy = userId;
    headerBarPayload.updatedDate = new Date();

    await this._headerBarRepository.save(headerBarPayload);
  }
}
