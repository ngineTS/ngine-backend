import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Navigation } from './entities/navigation.entity';
import { FindOptionsOrder, FindOptionsWhere, In, IsNull, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { RoleNavigationPermission } from '../role-navigation-permission/entities/role-navigation-permission.entity';
import { Permission } from '../permission/entities/permission.entity';
import { NavigationType } from '../navigation-type/entities/navigation-type.entity';
import { HeaderBar } from '../header-bar/entities/header-bar.entity';
import { RoleService } from '../role/role.service';
import { AuthService } from 'src/core/auth/auth.service';
import { Response } from 'express';


@Injectable()
export class NavigationService {

  constructor(@InjectRepository(Navigation)
              private _navigationRepository: Repository<Navigation>,
              @InjectRepository(NavigationType)
              private _navigationTypeRepository: Repository<NavigationType>,
              @InjectRepository(HeaderBar)
              private _headerBarRepository: Repository<HeaderBar>,
              @InjectRepository(User)
              private _userRepository: Repository<User>,
              @InjectRepository(RoleNavigationPermission)
              private _roleNavigationPermissionRepository: Repository<RoleNavigationPermission>,
              private _roleService: RoleService,
              private _authService: AuthService) {}


  /**
   * Find all flat navigations filtered by user permission.
   * @returns The array of navigations.
   */
  async findAllNavigations(
    userRequest: {
      sub: string;
      emailAddress: string;
      userNavigationPermissions: Array<{
        navigationId: string;
        permissionName: string;
      }>
    }
  ) {
    /* get nested navigations filtered by user permission */
    const navigations = await this.findNestedNavigations(userRequest) as Array<Navigation>;
    /* flatten navigations */
    const flatNavigations: any[] = [];
    for (let navigation of navigations) {
      this.flattenNavigations(navigation, flatNavigations);
    }
    /* check if user has 'add all navigations' access, if yes push 'none' navigation to array */
    if (
      userRequest.userNavigationPermissions.find(obj =>
        obj.navigationId === '00000000-0000-0000-0000-000000000000' &&
        obj.permissionName.includes('add')
      )
    ) {
      flatNavigations.push({
        id: null,
        name: 'none',
        displayLabel: 'None',
        navigationType: { name: 'header' }
      })
    }
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
      emailAddress: string;
      userNavigationPermissions: Array<{
        navigationId: string;
        permissionName: string;
      }>
    },
    res?: Response,
  ) {
    const userRoleNavigationPermissionsFormatted = await this.getUserRoleNavigationPermissionsFormatted(userRequest.sub);
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

    /* setup new request user navigation permissions */
    if (res) {
      const userNavigationPermissions: Array<{ navigationId: string; permissionName: string; }> = [];
      this.flattenNavigationPermissions(navigations, userNavigationPermissions);

      const allNavigationPermissionsAccess = await this._roleService.getUserRoleNavigationPermissionAllNavigationsOnly(userRequest.sub);
      if (allNavigationPermissionsAccess) {
        userNavigationPermissions.push({
          navigationId: allNavigationPermissionsAccess.navigationId,
          permissionName: allNavigationPermissionsAccess.permission.name
        })
      }

      const payload = { 
        sub: userRequest.sub,
        userEmail: userRequest.emailAddress,
        userNavigationPermissions: userNavigationPermissions  
      };

      /* Setup refresh token.*/
      const refreshToken = await this._authService.getRefreshToken(payload);
      res!.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: false, //TO CHANGE IN PROD
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000
      });

      /* Return access token. */
      const accessToken = await this._authService.getAccessToken(payload);

      return { navigations: navigations, access_token: accessToken };
    }

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
    if (depth > 0) {
      relations.add(base + 'children');
      base = base + 'children.';
      order.children = { order: 'ASC' };
      this.generateRelationsAndOrder(depth - 1, relations, order.children, base);
    }
  }


  /**
   * Filter out soft deleted navigations in the given navigation array.
   * 
   * If 'filterOutNavigationWithoutPermission' is true: filter out also navigation without permissions.
   * 
   * @param navigations The navigations to filter.
   * @param filterOutNavigationWithoutPermission A boolean specifying if we want to exclude the navigations without permission.
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
   * If user doesn't have 'add' permission on parent then throw Forbidden error.
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
    userId: string,
    userNavigationPermissions: Array<{
      navigationId: string;
      permissionName: string;
    }>
  ): Promise<Navigation> {
    /* valid permission */
    const parentId = createNavigationDto['parentId'] ?? '00000000-0000-0000-0000-000000000000';
    if (
      !userNavigationPermissions.find(obj => 
        obj.navigationId === parentId &&
        obj.permissionName.includes('add')
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

    /* create header bar if needed (if parentId null no need to create header bar because main header bar already created). */
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

    /* add metadata and save */
    createNavigationDto["createdBy"] = userId;
    createNavigationDto["createdDate"] = new Date();
    createNavigationDto["updatedBy"] = userId;
    createNavigationDto["updatedDate"] = new Date();
    return await this._navigationRepository.save(createNavigationDto);
  }


  /**
   * Update navigation properties.
   * 
   * * If user doesn't have 'edit' permission on navigation then throw Forbidden error.
   * * If navigation is not found then throw NotFound error.
   * 
   * If parentId has changed:
   * If navigation is header and doesn't have sister (i.e first header) 
   * then create header bar record associated to parent navigation (inherit config from parent header bar).
   * 
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
    /* valid permission */
    if (
      !userNavigationPermissions.find(obj => 
        obj.navigationId === id &&
        obj.permissionName.includes('edit')
      )
    ) {
      throw new ForbiddenException();
    }

    /* check if navigation exists and throw NotFound error if not */
    const navigation = await this._navigationRepository.findOne({
      where: { id: id },
      relations: ['navigationType']
    });
    if (!navigation) {
      throw new NotFoundException();
    }

    let updateResult;
    updateNavigationDto["updatedBy"] = userId;
    updateNavigationDto["updatedDate"] = new Date();

    const newParentNavigation = await this._navigationRepository.findOne({
      relations: ['children'],
      where: { 
        id: updateNavigationDto['parentId'],
        deletedDate: IsNull(),
      },
    });

    updateResult =  await this._navigationRepository.update(id, updateNavigationDto);

    const oldParentNavigation = await this._navigationRepository.findOne({
      relations: ['children', 'headerBar'],
      where: { 
        id: navigation.parentId,
        deletedDate: IsNull(),
      },
    });

    if (updateNavigationDto['parentId']) {
      if (navigation?.navigationType.name === 'header') {
        /* inherit header bar if needed */
        if (
          newParentNavigation 
          && newParentNavigation.children?.filter(obj => !obj.deletedDate).length === 0
        ) {
          await this.inheritParentHeaderBarConfig(updateNavigationDto["parentId"], userId);
        }

        /* delete header bar if needed */
        if (updateNavigationDto['parentId'] !== navigation.parentId) {
          if (
            oldParentNavigation 
            && oldParentNavigation.children?.filter(obj => !obj.deletedDate).length === 0
          ) {
            await this._headerBarRepository.delete(oldParentNavigation.headerBar!.id);
          }
        }
      }
    }
    
    return updateResult;
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
          obj.navigationId === navigation['id'] &&
          obj.permissionName.includes('edit')
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
   * Soft delete navigation and children and dependencies (header bars and navigation permissions).
   * 
   * If user doesn't have 'delete' permission on navigation then throw Forbidden error. 
   * 
   * If navigation was last of the sisters then delete parent header bar.
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
        obj.navigationId === navigation.id &&
        obj.permissionName.includes('delete')
      )
    ) {
      throw new ForbiddenException();
    }

    const navigationsIds: Array<string> = [];
    const navigationRecordsToDelete: Array<UpdateNavigationDto> = [];
    const headerBarIdsToDelete: Array<string> = [];

    /* Declare method to retrieve navigations and header bars to delete */
    const getDeepNavigationIds = async (navigation: Navigation) => {
      navigationsIds.push(navigation.id);
      navigationRecordsToDelete.push({
        id: navigation.id,
        deletedBy: userId,
        deletedDate: new Date()
      })
      const headerBar = await this._headerBarRepository.findOne({
        where: { navigationId: navigation.id }
      })
      if (headerBar) {
        headerBarIdsToDelete.push(headerBar.id);
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

    /* check if parent remains without children and delete associated header bar if yes.*/
    const parentNavigation = await this._navigationRepository.findOne({
      where: { 
        id: navigation.parentId ?? IsNull(),
        deletedDate: IsNull(),
      },
      relations: ['children', 'headerBar']
    });
    if (
      parentNavigation
      && parentNavigation.children?.filter(obj => !obj.deletedDate).length === 0
      && parentNavigation.headerBar
    ) {
      headerBarIdsToDelete.push(parentNavigation.headerBar.id);
    }
    
    /* delete header bars */
    for (const id of headerBarIdsToDelete) {
      await this._headerBarRepository.delete(id);
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
   * Get the parent header bar configuration and create header bar for given navigation.
   * @param navigationId The navigationId which we want to create a header bar.
   */
  async inheritParentHeaderBarConfig(navigationId: string, userId: string) {
    const navigation = await this._navigationRepository.findOne({
      where: { id: navigationId }
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
   * @param userNavigationPermissionsArray The array of navigation-permission couples.
   */
  flattenNavigationPermissions(
    navigations: Array<Navigation>,
    userNavigationPermissionsArray: Array<{
      navigationId: string;
      permissionName: string;
    }>
  ) {
    for (const navigation of navigations) {
      userNavigationPermissionsArray.push({
        navigationId: navigation.id,
        permissionName: navigation['permissionName']
      });
      if (navigation.children && navigation.children.length > 0) {
        this.flattenNavigationPermissions(navigation.children, userNavigationPermissionsArray);
      }
    }
  }
  
}
