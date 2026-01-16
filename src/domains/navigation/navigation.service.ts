import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Navigation } from './entities/navigation.entity';
import { FindOptionsOrder, FindOptionsWhere, In, IsNull, Not, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { RoleNavigationPermission } from '../role-navigation-permission/entities/role-navigation-permission.entity';
import { Permission } from '../permission/entities/permission.entity';
import { AuthService } from 'src/core/auth/auth.service';
import { MenuService } from '../menu/menu.service';
import { ContainerLayout } from '../container-layout/entities/container-layout.entity';
import { ContainerStyle } from '../container-style/entities/container-style.entity';
import { TypographyStyle } from '../typography-style/entities/typography-style.entity';


@Injectable()
export class NavigationService {

  constructor(
    @InjectRepository(Navigation)
    private _navigationRepository: Repository<Navigation>,
    @InjectRepository(User)
    private _userRepository: Repository<User>,
    @InjectRepository(RoleNavigationPermission)
    private _roleNavigationPermissionRepository: Repository<RoleNavigationPermission>,
    private _authService: AuthService,
    private _menuService: MenuService,
    @InjectRepository(ContainerLayout)
    private _containerLayoutRepository: Repository<ContainerLayout>,
    @InjectRepository(ContainerStyle)
    private _containerStyleRepository: Repository<ContainerStyle>,
    @InjectRepository(TypographyStyle)
    private _typographyStyleRepository: Repository<TypographyStyle>,
  ) {}

  /**
   * Find all flat navigations filtered by user permission.
   * @returns The array of navigations.
   */
  async findAllNavigations(
    userRequest: {
      sub: string;
      userEmail: string;
      userNavigationPermissions: Array<{
        navigationId: string;
        permissionName: string;
      }>
    }
  ) {
    /* get nested navigations filtered by user permission */
    const navigation = await this.findNestedNavigations(userRequest) as Navigation;

    /* flatten navigations */
    const flatNavigations: any[] = [];
    this.flattenNavigations(navigation, flatNavigations);
    
    return flatNavigations;
  }

  /**
   * Load Nested navigations filtered by user permissions.
   * @param userId The user id from the request.
   * @returns A nested navigations object.
   */
  async findNestedNavigations(
    userRequest: {
      sub: string;
      userEmail: string;
      userNavigationPermissions: Array<{
        navigationId: string;
        permissionName: string;
      }>
    },
    hasToGenerateNewToken = false,
  ) {
    /* Define TypeORM find options (relation, order, where). */
    const relations = new Set<string>();
    const order: FindOptionsOrder<Navigation> = { order: 'ASC' };
    const where: FindOptionsWhere<Navigation> = { id: '00000000-0000-0000-0000-000000000000' };
    this.generateRelationsAndOrder(6, relations, order); //TO DO: Replace 6 by the exact depth wished
    /* Get main navigation from db. */
    let navigation = await this._navigationRepository.findOne({
      relations: [...relations],
      where: where,
      order: order
    });

    /* Get user navigation permissions and clean navigations accordingly. */
    const userRoleNavigationPermissionsFormatted = await this.getUserRoleNavigationPermissionsFormatted(userRequest.sub);
    this.setUpUserNavigationPermission(navigation!, userRoleNavigationPermissionsFormatted);
    navigation!.children = this.cleanNavigations(navigation!.children);

    /* Add user navigation permissions to authentication token payload. */
    if (hasToGenerateNewToken) {
      const userNavigationPermissions: Array<{ navigationId: string; permissionName: string; }> = [];
      this.flattenNavigationPermissions(navigation!, userNavigationPermissions);

      const payload = { 
        sub: userRequest.sub,
        userEmail: userRequest.userEmail,
        userNavigationPermissions: userNavigationPermissions  
      };
      
      /* Return navigations and access token. */
      const accessToken = await this._authService.getAccessToken(payload);
      return { navigation: navigation, access_token: accessToken };
    }

    return navigation;
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
    relations.add(base + 'containerLayout');
    relations.add(base + 'containerStyle');
    relations.add(base + 'typographyStyle');
    relations.add(base + 'children');
    relations.add(base + 'menu');
    relations.add(base + 'menu.containerLayout');
    relations.add(base + 'menu.containerStyle');
    relations.add(base + 'menu.typographyStyle');
    if (depth > 0) {
      relations.add(base + 'children');
      base = base + 'children.';
      order.children = { order: 'ASC' };
      this.generateRelationsAndOrder(depth - 1, relations, order.children, base);
    }
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
   * - Case 1: Navigation permission found and it is higher than parent one - keep navigation permission.
   * - Case 2: Navigation permission found but parent permission is higher - navigation inherits parent navigation permission.
   * - Case 3: Navigation permission found and parent has no permission - keep navigation permission.
   * - Case 4: No navigation permission found but parent navigation permission found - navigation inherits parent navigation permission.
   * 
   * @param navigation The navigation to add "permissionName" prop.
   * @param userRoleNavigationPermissions The array of user roleNavigationPermissions.
   * @param parentNavigationPermission The parent navigation permission.
   */
  setUpUserNavigationPermission(
    navigation: Navigation,
    userRoleNavigationPermissions: RoleNavigationPermission[],
    parentNavigationPermission?: Permission
  ) {
    /* get current navigation permission */
    let navigationPermission = userRoleNavigationPermissions.find(obj => obj.navigationId === navigation.id)?.permission;
    
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
        navigationPermission
      );
    } 
  }

  /**
   * Save navigation with default style.
   * 
   * If user doesn't have 'add' permission on parent then throw Forbidden error.
   * 
   * If sister navigation with same name exists then throw BadRequest error.
   * 
   * @param createNavigationDto The navigation to save.
   * @returns The navigation saved.
   */
  async saveNavigation(
    createNavigationDto: CreateNavigationDto,
    userId: string,
    userNavigationPermissions: Array<{
      navigationId: string;
      permissionName: string;
    }>
  ): Promise<Navigation> {
    /* valid permission */
    if (
      !userNavigationPermissions.find(obj => 
        obj.navigationId === createNavigationDto['parentId'] && obj.permissionName.includes('add')
      )
    ) {
      throw new ForbiddenException();
    }

    /* valid technical name */
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

    /* add metadata and save */
    createNavigationDto["createdBy"] = userId;
    createNavigationDto["createdDate"] = new Date();
    createNavigationDto["updatedBy"] = userId;
    createNavigationDto["updatedDate"] = new Date();
    const navigationSaved = await this._navigationRepository.save(createNavigationDto);
    await this._menuService.createDefaultContainerLayout(navigationSaved.id);
    await this._menuService.createDefaultContainerStyle(navigationSaved.id);
    await this._menuService.createDefaultTypographyStyle(navigationSaved.id);
    return navigationSaved;
  }

  /**
   * Update navigation properties.
   * 
   * * If user doesn't have 'edit' permission on navigation then throw Forbidden error.
   * * If navigation is not found then throw NotFound error.
   * * If navigation sister has already the same name then throw BadRequest error.
   * * If parent id has changed and new parent has a menu and no more children then delete menu.
   * 
   * @param id The navigation id.
   * @param updateNavigationDto The navigation properties to update.
   * @returns An UpdateResponse type object.
   */
  async updateNavigation(
    id: string,
    updateNavigationDto: UpdateNavigationDto,
    userId: string,
    userNavigationPermissions: Array<{
      navigationId: string;
      permissionName: string;
    }> 
  ) {
    /* Valid permission. */
    if (
      !userNavigationPermissions.find(obj => 
        obj.navigationId === id && obj.permissionName.includes('edit')
      )
    ) {
      throw new ForbiddenException();
    }
    if (
      'parentId' in updateNavigationDto &&
      !userNavigationPermissions.find(obj => {
        return obj.navigationId === updateNavigationDto.parentId && obj.permissionName.includes('add');
      })
    ) {
      throw new ForbiddenException();
    }

    /* Get navigation and throw error if not found. */
    const navigation = await this._navigationRepository.findOne({
      where: { id: id },
      relations: ['navigationType']
    });
    if (!navigation) {
      throw new NotFoundException();
    }

    /* If displayLabel has changed then assign name property 
       and throw error if sister has already same name. */
    if (updateNavigationDto['displayLabel']) {
       updateNavigationDto['name'] = updateNavigationDto['displayLabel'].toLowerCase()?.replace(/ /g, "-");
       const sisterNavigations = await this._navigationRepository.find({
        where: {
          parentId: updateNavigationDto['parentId'] ?? navigation.parentId,
          deletedDate: IsNull(),
          id: Not(navigation.id)
        },
      });
      if (sisterNavigations.find(nav => nav.name === updateNavigationDto['name'])) {
        throw new BadRequestException('This name already exists.');
      }
    }

    /* If parent has changed then delete old parent menu if needed
       (i.e old parent has a menu associated and had one navigation only). */
    if ('parentId' in updateNavigationDto && updateNavigationDto.parentId !== navigation.parentId) {
      const oldParentNavigation = await this._navigationRepository.findOne({
        relations: ['children', 'menu'],
        where: { 
          id: navigation.parentId,
          deletedDate: IsNull(),
        },
      });
      if (oldParentNavigation?.menu && oldParentNavigation?.children?.filter(obj => !obj.deletedDate).length === 1) {
        await this._menuService.remove(oldParentNavigation.menu.id);
        await this._containerLayoutRepository.delete({ refId: oldParentNavigation.menu.id });
        await this._containerStyleRepository.delete({ refId: oldParentNavigation.menu.id });
        await this._typographyStyleRepository.delete({ refId: oldParentNavigation.menu.id });
      }
    }

    /* Setup metadata and udpate entity. */
    updateNavigationDto["updatedBy"] = userId;
    updateNavigationDto["updatedDate"] = new Date();
    return await this._navigationRepository.update(id, updateNavigationDto);
  }

  /**
   * Update Array of navigations.
   * 
   * If user doesn't have 'edit' permission on one of the items then throw Forbidden error.
   * 
   * @param updateNavigationDtoArray The array of navigations.
   * @returns The array of navigations saved.
   */
  async updateNavigations(
    updateNavigationDtoArray: UpdateNavigationDto[],
    userId: string,
    userNavigationPermissions: Array<{
      navigationId: string;
      permissionName: string;
    }> 
  ) {
    /* valid permission and setup metadata */
    updateNavigationDtoArray.forEach(navigation => {
      if (
        !userNavigationPermissions.find(obj =>
          obj.navigationId === navigation['id'] && obj.permissionName.includes('edit')
        )
      ) {
        throw new ForbiddenException();
      }
      else {
        navigation["updatedBy"] = userId;
        navigation["updatedDate"] = new Date();
      }
    });

    return await this._navigationRepository.save(updateNavigationDtoArray);
  }

  /**
   * Soft delete navigation and children and dependencies.
   * 
   * If user doesn't have 'delete' permission on navigation then throw Forbidden error. 
   * 
   * If navigation was last of the sisters then delete parent menu.
   * @param navigation The navigation to soft delete.
   * @returns The Array of navigation that have been soft deleted.
   */
  async removeNavigation(
    navigation: Navigation,
    userId: string,
    userNavigationPermissions: Array<{
      navigationId: string;
      permissionName: string;
    }>
  ) {
    /* valid permission */
    if (
      !userNavigationPermissions.find(obj => 
        obj.navigationId === navigation.id && obj.permissionName.includes('delete')
      )
    ) {
      throw new ForbiddenException();
    }

    const navigationsIds: Array<string> = [];
    const navigationRecordsToDelete: Array<UpdateNavigationDto> = [];
    const menuIdsToDelete: Array<string> = [];

    /* Declare method to retrieve navigations and menus to delete */
    const getDeepNavigationIds = async (navigation: Navigation) => {
      navigationsIds.push(navigation.id);
      navigationRecordsToDelete.push({
        id: navigation.id,
        deletedBy: userId,
        deletedDate: new Date()
      })
      const menu = await this._menuService.findOneByNavigationId(navigation.id);
      if (menu) {
        menuIdsToDelete.push(menu.id);
      }
      if (navigation.children) {
        for (const nav of navigation.children) {
            await getDeepNavigationIds(nav);
        }
      }
    } 

    /* call method */
    await getDeepNavigationIds(navigation);

    /* delete navigations */
    const navigationsSoftDeleted = await this._navigationRepository.save(navigationRecordsToDelete);

    /* delete navigation style properties */
    for (const navigation of navigationRecordsToDelete) {
      await this._containerLayoutRepository.delete({ refId: navigation['id'] });
      await this._containerStyleRepository.delete({ refId: navigation['id']});
      await this._typographyStyleRepository.delete({ refId: navigation['id'] });
    }

    /* check if parent remains without children and delete associated menu if yes.*/
    const parentNavigation = await this._navigationRepository.findOne({
      where: { 
        id: navigation.parentId,
        deletedDate: IsNull(),
      },
      relations: ['children', 'menu']
    });
    if (
      parentNavigation
      && parentNavigation.children?.filter(obj => !obj.deletedDate).length === 0
      && parentNavigation.menu
    ) {
      menuIdsToDelete.push(parentNavigation.menu.id);
    }
    
    /* delete menus */
    for (const id of menuIdsToDelete) {
      await this._menuService.remove(id);
      await this._containerLayoutRepository.delete({ refId: id });
      await this._containerStyleRepository.delete({ refId: id });
      await this._typographyStyleRepository.delete({ refId: id });

    }

    /* delete related role navigation permissions entities */
    const roleNavigationsPermissions = await this._roleNavigationPermissionRepository.find({
      where: { navigationId: In(navigationsIds) }
    })
    for (let roleNavigationsPermission of roleNavigationsPermissions) {
      roleNavigationsPermission.deletedBy = userId;
      roleNavigationsPermission.deletedDate = new Date();
    }
    await this._roleNavigationPermissionRepository.save(roleNavigationsPermissions);

    return { affected: navigationsSoftDeleted.length }
  }

  /**
   * Flatten nested navigations.
   * @param navigation navigation to flatten.
   * @param flatNavigations array to store flat navigations.
   */
  flattenNavigations(navigation: Navigation, flatNavigations: Array<Navigation>) {
    flatNavigations.push(navigation);
    if (navigation.children && navigation.children.length > 0) {
      for (const child of navigation.children) {
        this.flattenNavigations(child, flatNavigations);
      }
    }
  }

  /**
   * Store navigation permissions from nested navigations.
   * @param navigations The navigations with permission name.
   * @param userNavigationPermissionsArray The array of navigation permission couple.
   */
  flattenNavigationPermissions(
    navigation: Navigation,
    userNavigationPermissionsArray: Array<{
      navigationId: string;
      permissionName: string;
    }>
  ) {
    userNavigationPermissionsArray.push({
      navigationId: navigation.id,
      permissionName: navigation['permissionName']
    });
    if (navigation.children && navigation.children.length > 0) {
      for (const child of navigation.children) {
        this.flattenNavigationPermissions(child, userNavigationPermissionsArray);
      }
    }
  }
  
  /**
   * Check if navigation has a permission.
   * If yes return true else check check for his children recursively.
   * If no permission found after recursion then return false.
   * @param navigation The navigation to check.
   * @returns true or false.
   */
  doesPermissionExistOnNavigationOrHisChildren(navigation: Navigation): boolean {
    if (navigation['permissionName']) {
      return true;
    }
    else if (navigation.children && navigation.children.length > 0 ){
      for (const child of navigation.children) {
        return this.doesPermissionExistOnNavigationOrHisChildren(child);
      }
    }

    return false;
  }


  /**
   * Clean navigations based on the following rules:
   * * remove deleted navigations (deletedDate not null)
   * * remove navigations with no permission or if his children or grand children have no permission
   * @param navigations The array of navigations to clean.
   * @returns The array of navigations cleaned.
   */
  cleanNavigations(navigations: Array<Navigation>): Array<Navigation> {
    for (let navigation of navigations) {
      if (navigation.children) {
        navigation.children = this.cleanNavigations(navigation.children);
      }
    }

    return navigations.filter(
      navigation => this.doesPermissionExistOnNavigationOrHisChildren(navigation) && !navigation.deletedDate
    );
  }

}
