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
import { NavigationType } from '../navigation-type/entities/navigation-type.entity';


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
    @InjectRepository(ContainerLayout)
    private _containerLayoutRepository: Repository<ContainerLayout>,
    @InjectRepository(ContainerStyle)
    private _containerStyleRepository: Repository<ContainerStyle>,
    @InjectRepository(TypographyStyle)
    private _typographyStyleRepository: Repository<TypographyStyle>,
  ) {}

  /**
   * Find all flat navigations with navigationType filtered by user permission.
   * 
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
    const userNavigationIds = userRequest.userNavigationPermissions.map<string>(
      userNavigationPermission => userNavigationPermission.navigationId
    )

    return await this._navigationRepository.find({
      where: { id: In(userNavigationIds) },
      relations: ['navigationType']
    });
  }

  /**
   * Load Nested navigations filtered by user permissions.
   * 
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
    this.generateRelationsAndOrder(8, relations, order); //TO DO: Replace 6 by the exact depth wished
    /* Get main navigation from db. */
    let mainNavigation = await this._navigationRepository.findOne({
      relations: [...relations],
      where: where,
      order: order
    });

    /* Get user navigation permissions and clean navigations accordingly. */
    const userRoleNavigationPermissionsFormatted = await this.getUserRoleNavigationPermissionsFormatted(userRequest.sub);
    this.setUpUserNavigationPermission(mainNavigation!, userRoleNavigationPermissionsFormatted);
    mainNavigation!.children = this.cleanNavigations(mainNavigation!.children);

    /* Add user navigation permissions to authentication token payload. */
    if (hasToGenerateNewToken) {
      const userNavigationPermissions: Array<{ navigationId: string; permissionName: string; }> = [];
      this.flattenNavigationPermissions(mainNavigation!, userNavigationPermissions);

      const payload = { 
        sub: userRequest.sub,
        userEmail: userRequest.userEmail,
        userNavigationPermissions: userNavigationPermissions  
      };
      
      /* Return navigations and access token. */
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
   * @returns The navigation saved.
   * @throws {ForbiddenException} If user doesn't have 'add' permission on parent.
   * @description
   * 1. Valid user permission and navigation business rules.
   * 2. Add audit data and save navigation.
   * 3. Inherit style from parent and save style properties.
   * 4. Associate menu to navigation up to navigation type.
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
        obj.navigationId === createNavigationDto.parentId && obj.permissionName.includes('add')
      )
    ) {
      throw new ForbiddenException();
    }

    /* valid navigation business rules */
    await this.validNavigationDto(createNavigationDto);

    /* add metadata and save navigation */
    createNavigationDto['createdBy'] = userId;
    createNavigationDto['createdDate'] = new Date();
    createNavigationDto['updatedBy'] = userId;
    createNavigationDto['updatedDate'] = new Date();
    const navigationSaved = await this._navigationRepository.save(createNavigationDto);

    /* inherit parent navigation style */
    let parentRefId = navigationSaved.parentId;
    if (parentRefId === '00000000-0000-0000-0000-000000000000') {
      parentRefId = (await this._menuService.findOneByNavigationId(parentRefId))!.id;
    }
    await this._menuService.inheritParentStyle(navigationSaved.id, parentRefId);

    /* create menu if navigation is menu button */
    const menuButtonNavigationType = await this._navigationTypeRepository.findOne({
      where: { name: 'menu-button' }
    });
    if (navigationSaved.navigationTypeId === menuButtonNavigationType!.id) {
      const menuSaved = await this._menuService.createMenu(navigationSaved.id);
      await this._menuService.inheritParentStyle(menuSaved.id, navigationSaved.id);
    }

    return navigationSaved;
  }

  /**
   * Update navigation properties.
   * 
   * @param id The navigation id.
   * @param updateNavigationDto The navigation properties to update.
   * @returns An UpdateResponse type object.
   * @throws {ForbiddenException} If user doesn't have 'edit' permission on navigation.
   * @throws {ForbiddenException} If parentId is is the request and user doesn't have 'add' permisson on it.
   * @throws {NotFoundException} If navigation id is not found in database.
   * @description
   * 1. Valid user permission and navigation business rule.
   * 2. If parent has changed and old parent has no more children then delete his menu.
   * 3. Add audit data and update navigation.
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
    const dbNavigation = await this._navigationRepository.findOne({
      where: { id: id }
    });
    if (!dbNavigation) {
      throw new NotFoundException();
    }

    /* 1. */
    if (
      !userNavigationPermissions.find(obj => obj.navigationId === id && obj.permissionName.includes('edit')
      )
    ) {
      throw new ForbiddenException();
    }
    
    await this.validNavigationDto(updateNavigationDto, id);
    
    if ('parentId' in updateNavigationDto && updateNavigationDto.parentId !== dbNavigation.parentId) {
      if(
        !userNavigationPermissions.find(obj => 
        obj.navigationId === updateNavigationDto.parentId && obj.permissionName.includes('add')
      )) {
        throw new ForbiddenException();
      }
      
      /* 2. */
      const oldParentNavigation = await this._navigationRepository.findOne({
        relations: ['children', 'menu'],
        where: { 
          id: dbNavigation.parentId,
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

    /* 3. */
    updateNavigationDto["updatedBy"] = userId;
    updateNavigationDto["updatedDate"] = new Date();
    return await this._navigationRepository.update(id, updateNavigationDto);
  }

  /**
   * Update Array of navigations.
   * 
   * @param updateNavigationDtoArray The array of navigations.
   * @returns The array of navigations saved.
   * @throws {ForbiddenException} If user doesn't have edit permission on one of the navigations.
   * @description
   * 1. Valid user permission.
   * 2. Add audit data and update navigation.
   */
  async updateNavigations(
    updateNavigationDtoArray: UpdateNavigationDto[],
    userId: string,
    userNavigationPermissions: Array<{
      navigationId: string;
      permissionName: string;
    }> 
  ) {
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
   * Delete navigation, his descendants and related dependencies.
   * 
   * @param navigation The navigation to delete.
   * @returns The Array of navigations that have been soft deleted.
   * @throws {ForbiddenException} If user doesn't have delete permission on navigation to delete.
   * @description
   * 1. Valid user permission.
   * 2. Retrieve recursively children and related menu to delete.
   * 3. Soft delete navigation, his descendants and delete related style properties.
   * 4. Check if parent navigation has a menu and remains without children. If yes retrieve menu to delete.
   * 5. Delete menus retrieved on step 2 & 4 and style properties.
   * 6. Delete roleNavigationPermissions associated to navigations deleted.
   * 7. Return number of navigation soft deleted.
   */
  async removeNavigation(
    navigation: Navigation,
    userId: string,
    userNavigationPermissions: Array<{
      navigationId: string;
      permissionName: string;
    }>
  ) {
    /* 1. */
    if (
      !userNavigationPermissions.find(obj => 
        obj.navigationId === navigation.id && obj.permissionName.includes('delete')
      )
    ) {
      throw new ForbiddenException();
    }

    /* 2. */
    const navigationsIds: Array<string> = [];
    const navigationRecordsToDelete: Array<Partial<Navigation>> = [];
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

    /* 3. */
    const navigationsSoftDeleted = await this._navigationRepository.save(navigationRecordsToDelete);
    for (const navigation of navigationRecordsToDelete) {
      await this._containerLayoutRepository.delete({ refId: navigation['id'] });
      await this._containerStyleRepository.delete({ refId: navigation['id']});
      await this._typographyStyleRepository.delete({ refId: navigation['id'] });
    }

    /* 4. */
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

    /* 5. */
    for (const id of menuIdsToDelete) {
      await this._menuService.remove(id);
      await this._containerLayoutRepository.delete({ refId: id });
      await this._containerStyleRepository.delete({ refId: id });
      await this._typographyStyleRepository.delete({ refId: id });

    }

    /* 6. */
    const roleNavigationsPermissions = await this._roleNavigationPermissionRepository.find({
      where: { navigationId: In(navigationsIds) }
    })
    for (let roleNavigationsPermission of roleNavigationsPermissions) {
      roleNavigationsPermission.deletedBy = userId;
      roleNavigationsPermission.deletedDate = new Date();
    }
    await this._roleNavigationPermissionRepository.save(roleNavigationsPermissions);
    
    /* 7. */ 
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
    userNavigationPermissionsArray: Array<{
      navigationId: string;
      permissionName: string;
    }>
  ) {
    if (navigation['permissionName']) {
      userNavigationPermissionsArray.push({
      navigationId: navigation.id,
      permissionName: navigation['permissionName']
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
   * - remove navigations with no permission or if his descendants have no permission
   * - remove disabled navigations if user doesn't `add` permission on it.
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

  /**
   * Valid navigation business rules before saving.
   * 
   * @param navigationDto The navigation to insert or update.
   * @param navigationId The navigation id to update (optional).
   * @throws {NotFoundException} If `navigationDto.parentId` is not found in the database.
   * @throws {NotFoundException} If `navigationDto.navigationTypeId` is not found in the database.
   * @throws {BadRequestException} If `navigationDto` type is a button and parent is not a menu or a redirect-button.
   * @throws {BadRequestException} If `navigationDto` type is a component and parent is not a dialog-button or a redirect-button without nav bar.
   * @throws {BadRequestException} If `navigationDto.name` is already used by sister navigations.
   * @throws {BadRequestException} If `navigationDto.parentId` is equal to `navigationId`.
   * @throws {BadRequestException} If `navigationDto` parent is found in the descendants of navigation to update.
   * @throws {BadRequestException} If `navigationDto.showIconOnly` is true and `navigationDto.icon` is empty.
   */
  async validNavigationDto(
    navigationDto: UpdateNavigationDto,
    navigationId?: string
  ) {

    if(navigationDto.parentId) {
      let parentNavigation = await this._navigationRepository.findOne({
        where: { 
          id: navigationDto.parentId,
          deletedDate: IsNull(),
        },
        relations: [
          'navigationType',
          'menu',
          'children'
        ]
      });
    
      if (!parentNavigation) {
        throw new NotFoundException(`Parent ${navigationDto.parentId} doesn't exist.`)
      }
      parentNavigation.children = parentNavigation.children.filter(child => !child.deletedDate);

      const navigationType = await this._navigationTypeRepository.findOne({
        where: { id: navigationDto.navigationTypeId }
      });
      if (!navigationType) {
        throw new NotFoundException(`Navigation type ${navigationDto.navigationTypeId} doesn't exist.`)
      }

      /* if it is a custom button */
      if (
        navigationType.name === 'redirect-button' ||
        navigationType.name === 'menu-button' ||
        navigationType.name === 'dialog-button' ||
        navigationType.name === 'external-link-button'
      ) {
        if (
          parentNavigation.navigationType.name !== 'redirect-button' &&
          parentNavigation.navigationType.name !== 'menu-button'
        ) {
          throw new BadRequestException(
            `${navigationType.displayLabel} cannot be a added inside ${parentNavigation.navigationType.displayLabel}.`
          );
        }
      }
      /* if it is a component */
      else {
        if (
          parentNavigation.navigationType.name !== 'redirect-button' &&
          parentNavigation.navigationType.name !== 'dialog-button'
        ) {
          throw new BadRequestException(
            `${navigationType.displayLabel} cannot be added inside ${parentNavigation.navigationType.displayLabel}.`
          );
        }
        if (parentNavigation.menu) {
          throw new BadRequestException(
            `${navigationType.displayLabel} cannot be added inside a menu.`
          );
        }
      }
      
      if (navigationDto.displayLabel) {
        navigationDto['name'] = navigationDto.displayLabel?.toLowerCase()?.replace(/ /g, "-");
        const sisterNavigations = parentNavigation.children.filter(child => child.id !== navigationId);
        
        if (sisterNavigations?.find(navigation => navigation.name ===  navigationDto['name'])) {
          throw new BadRequestException('A sister navigation has already this name.');
        }
      }

      if (navigationId) {
        if (navigationId === navigationDto.parentId) {
          throw new BadRequestException('Parent cannot be same navigation');
        }

        await this.checkIfIsADescendant(navigationId, navigationDto.parentId);
      }

      if (navigationDto.showIconOnly && !navigationDto.icon) {
        throw new BadRequestException(`"Show icon only" can't be true if there is no icon.`);
      }
      
      //TODO: Valid and external link input based on on nav type
    }
  }

  /**
   * Check if given navigation is in descendants of other navigation.
   * 
   * @param navigationId The navigation with descendants.
   * @param parentId The navigation to check.
   */
  async checkIfIsADescendant(navigationId: string, parentId: string) {

    const rows = await this._navigationRepository.query(
      `
      WITH RECURSIVE descendants AS (
        SELECT id
        FROM my_app.navigation
        WHERE "parentId" = $1
        UNION ALL
        SELECT n.id
        FROM my_app.navigation n
        JOIN descendants d ON n."parentId" = d.id
      )
      SELECT 1
      FROM descendants
      WHERE id = $2
      LIMIT 1
      `,
      [navigationId, parentId],
    );

    if (rows.length) {
      throw new BadRequestException('Parent cannot be a descendant');
    }
  }

}
