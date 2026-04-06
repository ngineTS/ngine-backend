import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Navigation } from './entities/navigation.entity';
import { FindOptionsWhere, In, IsNull, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { RoleNavigationPermission } from '../role-navigation-permission/entities/role-navigation-permission.entity';
import { Permission } from '../permission/entities/permission.entity';
import { AuthService } from 'src/core/auth/auth.service';
import { MenuService } from '../menu/menu.service';
import { NavigationType } from '../navigation-type/entities/navigation-type.entity';
import { NavigationPermissions } from 'src/core/models/navigation-permissions.interface';
import { ContainerStyleService } from '../container-style/container-style.service';
import { TypographyStyleService } from '../typography-style/typography-style.service';
import { ContainerLayoutService } from '../container-layout/container-layout.service';


@Injectable()
export class NavigationService {

  constructor(
    @InjectRepository(Navigation)
    private _navigationRepository: Repository<Navigation>,
    @InjectRepository(NavigationType)
    private _navigationTypeRepository: Repository<NavigationType>,
    @InjectRepository(User)
    private _userRepository: Repository<User>,
    @InjectRepository(RoleNavigationPermission)
    private _roleNavigationPermissionRepository: Repository<RoleNavigationPermission>,
    private _authService: AuthService,
    private _menuService: MenuService,
    private _containerLayoutService: ContainerLayoutService,
    private _containerStyleService: ContainerStyleService,
    private _typographyStyleService: TypographyStyleService
  ) {}

  /**
   * Find all flat navigations with their navigationType filtered by user permission.
   * 
   * @param userNavigationPermissions The user navigation permissions from request.
   * @returns The array of navigations.
   */
  async findAllNavigations(userNavigationPermissions: NavigationPermissions) {
    const userNavigationIds = userNavigationPermissions.map<string>(
      userNavigationPermission => userNavigationPermission.navigationId
    );

    return await this._navigationRepository.find({
      where: { id: In(userNavigationIds) },
      relations: ['navigationType', 'parent'],
      order: { displayLabel: 'ASC' }
    });
  }

  /**
   * Load Nested navigations filtered by user permissions.
   * 
   * @param userId The user id from the request.
   * @param userEmail The user email from the request.
   * @param hasToGenerateNewToken A boolean specifying if we should regenerate auth token or not (optional).
   * @returns A nested navigations object.
   */
  async findNestedNavigations(
    userId: string,
    userEmail: string,
    hasToGenerateNewToken = false,
  ) {
    /* define TypeORM find options (relation, order, where). */
    const relations = new Set<string>();
    const where: FindOptionsWhere<Navigation> = { id: '00000000-0000-0000-0000-000000000000' };
    this.generateRelationsAndOrder(8, relations); //TO DO: Replace 6 by the exact depth wished
    
    /* get main navigation from db. */
    let mainNavigation = await this._navigationRepository.findOne({
      relations: [...relations],
      where: where,
    });

    /* get user navigation permissions and clean navigations accordingly. */
    const userRoleNavigationPermissionsFormatted = await this.getUserRoleNavigationPermissionsFormatted(userId);
    this.setUpUserNavigationPermission(mainNavigation!, userRoleNavigationPermissionsFormatted);
    mainNavigation!.children = this.cleanNavigations(mainNavigation!.children);

    /* add user navigation permissions to authentication token payload. */
    if (hasToGenerateNewToken) {
      const userNavigationPermissions: NavigationPermissions = [];
      this.flattenNavigationPermissions(mainNavigation!, userNavigationPermissions);

      const payload = {
        sub: userId,
        userEmail: userEmail,
        userNavigationPermissions: userNavigationPermissions
      };
      
      /* return navigations and access token. */
      const accessToken = await this._authService.getAccessToken(payload);
      return { navigation: mainNavigation, access_token: accessToken };
    }

    return mainNavigation;
  }

  /**
   * Generate navigation relations until given depth.
   * 
   * @param depth The number of nested levels.
   * @param relations The existing set of relations.
   * @param order The existing TypeORM order property.
   * @param base The relation base.
   */
  generateRelationsAndOrder(
    depth: number, 
    relations: Set<string>,
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
      this.generateRelationsAndOrder(depth - 1, relations, base);
    }
  }

  /**
   * Format user roleNavigationPermissions.
   * 
   * @param userId the id of the user.
   * @returns The user roleNavigationPermissions formatted.
   * @description
   * If a user is assigned to multiple roles which share the same navigations
   * then we keep only the navigations with highest priviledge.
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
   * @param navigation The navigation to add "permissionName" prop.
   * @param userRoleNavigationPermissions The array of user roleNavigationPermissions.
   * @param parentNavigationPermission The parent navigation permission.
   * @description
   * - Case 1. Navigation permission found and it is higher than parent one - keep navigation permission.
   * - Case 2. Navigation permission found but parent permission is higher - navigation inherits parent navigation permission.
   * - Case 3. Navigation permission found and parent has no permission - keep navigation permission.
   * - Case 4. No navigation permission found but parent navigation permission found - navigation inherits parent navigation permission.
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
   * @param createNavigationDto The navigation to save.
   * @param userId The user id from request.
   * @returns The navigation saved.
   * @description
   * 1. Add audit data and save navigation.
   * 2. Assign style properties.
   * 3. If navigation is a menu button then create menu.
   */
  async saveNavigation(
    createNavigationDto: CreateNavigationDto,
    userId: string,
  ): Promise<Navigation> {
    /* 1. */
    createNavigationDto['createdBy'] = userId;
    createNavigationDto['createdDate'] = new Date();
    createNavigationDto['updatedBy'] = userId;
    createNavigationDto['updatedDate'] = new Date();
    const navigationSaved = await this._navigationRepository.save(createNavigationDto);

    /* 2. */
    await this._containerLayoutService.createObjectContainerLayout({ refId: navigationSaved.id });
    await this._containerStyleService.createObjectContainerStyle(navigationSaved.id);
    await this._typographyStyleService.createObjectTypographyStyle(navigationSaved.id);

    /* 3. */
    const menuButtonNavigationType = await this._navigationTypeRepository.findOne({
      where: { name: 'menu-button' }
    });
    if (navigationSaved.navigationTypeId === menuButtonNavigationType!.id) {
      const menuSaved = await this._menuService.createMenu(navigationSaved.id);
      await this._containerLayoutService.createObjectContainerLayout({ refId: menuSaved.id });
      await this._containerStyleService.createObjectContainerStyle(menuSaved.id);
      await this._typographyStyleService.createObjectTypographyStyle(menuSaved.id);
    }

    return navigationSaved;
  }

  /**
   * Update navigation.
   * 
   * @param id The navigation id.
   * @param updateNavigationDto The navigation properties to update.
   * @param userId The user id from request.
   * @returns An UpdateResponse type object.
   * @throws {NotFoundException} If navigation id is not found in database.
   * @description
   * 1. Get existing navigation from db.
   * 2. If parent has changed and old parent has no more children then delete his menu.
   * 3. Add audit data and update navigation.
   */
  async updateNavigation(
    id: string,
    updateNavigationDto: UpdateNavigationDto,
    userId: string,
  ) {
    /* 1 */
    const dbNavigation = await this._navigationRepository.findOne({
      where: { id: id }
    });
    if (!dbNavigation) {
      throw new NotFoundException();
    }
    
    /* 2. */
    if ('parentId' in updateNavigationDto && updateNavigationDto.parentId !== dbNavigation.parentId) {
      const oldParentNavigation = await this._navigationRepository.findOne({
        relations: ['children', 'menu'],
        where: { 
          id: dbNavigation.parentId,
          deletedDate: IsNull(),
        },
      });
      if (oldParentNavigation?.menu && oldParentNavigation?.children?.filter(obj => !obj.deletedDate).length === 1) {
        await this._menuService.remove(oldParentNavigation.menu.id);
        await this._containerLayoutService.deleteByRefId(oldParentNavigation.menu.id);
        await this._containerStyleService.deleteByRefId(oldParentNavigation.menu.id);
        await this._typographyStyleService.deleteByRefId(oldParentNavigation.menu.id);
      }
    }

    /* 3. */
    updateNavigationDto["updatedBy"] = userId;
    updateNavigationDto["updatedDate"] = new Date();
    return await this._navigationRepository.update(id, updateNavigationDto);
  }

  /**
   * Update Array of navigations.
   * 
   * @param navigations The array of navigations.
   * @param userId: The user id from request.
   * @returns The array of navigations saved.
   */
  async updateNavigations(navigations: Array<Navigation>, userId: string) {
    navigations.forEach(navigation => {
      navigation["updatedBy"] = userId;
      navigation["updatedDate"] = new Date();
    });
    
    return await this._navigationRepository.save(navigations);
  }

  /**
   * Delete navigation, his descendants and related dependencies.
   * 
   * @param navigation The navigation to delete.
   * @param userId The user id from request.
   * @returns The Array of navigations that have been soft deleted.
   * @description
   * 1. Retrieve recursively children and related menu to delete.
   * 2. Soft delete navigation, his descendants and delete related style properties.
   * 3. Check if parent navigation has a menu and remains without children. If yes retrieve menu to delete.
   * 4. Delete menus retrieved on step 2 & 4 and delete style properties.
   * 5. Delete roleNavigationPermissions associated to navigations deleted.
   * 6. Return number of navigation soft deleted.
   */
  async removeNavigation(navigation: Navigation, userId: string) {
    /* 1. */
    const navigationsIds: Array<string> = [];
    const navigationRecordsToDelete: Array<Pick<Navigation, 'id' | 'deletedBy' | 'deletedDate'>> = [];
    const menuIdsToDelete: Array<string> = [];
    /* declare method to retrieve navigations and menus to delete */
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

    /* 2. */
    const navigationsSoftDeleted = await this._navigationRepository.save(navigationRecordsToDelete);
    for (const navigation of navigationRecordsToDelete) {
      await this._containerLayoutService.deleteByRefId(navigation.id);
      await this._containerStyleService.deleteByRefId(navigation.id);
      await this._typographyStyleService.deleteByRefId(navigation.id);
    }
    
    /* 3. */
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

    /* 4. */
    for (const id of menuIdsToDelete) {
      await this._menuService.remove(id);
      await this._containerLayoutService.deleteByRefId(id);
      await this._containerStyleService.deleteByRefId(id);
      await this._typographyStyleService.deleteByRefId(id);
    }

    /* 5. */
    const roleNavigationsPermissions = await this._roleNavigationPermissionRepository.find({
      where: { navigationId: In(navigationsIds) }
    })
    for (let roleNavigationsPermission of roleNavigationsPermissions) {
      roleNavigationsPermission.deletedBy = userId;
      roleNavigationsPermission.deletedDate = new Date();
    }
    await this._roleNavigationPermissionRepository.save(roleNavigationsPermissions);
    
    /* 6. */ 
    return { affected: navigationsSoftDeleted.length }
  }

  /**
   * Store navigation permissions from nested navigations.
   * 
   * @param navigation The main navigation with permission name.
   * @param userNavigationPermissionsArray The array of navigation permission couple.
   */
  flattenNavigationPermissions(
    navigation: Navigation,
    userNavigationPermissionsArray: NavigationPermissions
  ) {
    if (navigation['permissionName']) {
      userNavigationPermissionsArray.push({
      navigationId: navigation.id,
      permissionName: navigation['permissionName'],
      navigationTypeName: navigation.navigationType.name
    });
    }
    if (navigation.children && navigation.children.length > 0) {
      for (const child of navigation.children) {
        this.flattenNavigationPermissions(child, userNavigationPermissionsArray);
      }
    }
  }
  
  /**
   * Check if navigation has a permission and if it is disabled check if permission is minimum `add`.
   * If yes return true else check check for his children recursively.
   * If no permission found after recursion then return false.
   * 
   * @param navigation The navigation to check.
   * @returns true or false.
   */
  doesPermissionExistOnNavigationOrDescendants(navigation: Navigation): boolean {
    if (navigation['permissionName']) {
      if (navigation.isDisabled) {
        if (navigation['permissionName'].includes('add')) {
          return true;
        }
        else {
          return false;
        }
      }
      return true;
    }
    else if (navigation.children && navigation.children.length > 0 ){
      for (const child of navigation.children) {
        return this.doesPermissionExistOnNavigationOrDescendants(child);
      }
    }

    return false;
  }

  /**
   * Clean navigations based on the following rules:
   * - remove deleted navigations (deletedDate not null)
   * - remove navigations if them and their descendants have no permission
   * - remove disabled navigations if user doesn't have `add` permission on it.
   * 
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
      navigation => this.doesPermissionExistOnNavigationOrDescendants(navigation) && !navigation.deletedDate
    );
  }

}
