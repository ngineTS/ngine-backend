import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    private _typographyStyleService: TypographyStyleService,
    
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

  async findTree(
    rootId: string,
    maxDepth: number,
    userId: string
  ) {
    // Step 1: load root
    const root = await this._navigationRepository.findOne({ where: { id: rootId } });
    const userRoleNavigationPermissionsFormatted = await this.getUserRoleNavigationPermissionsFormatted(userId);

    if (!root) {
      throw new BadRequestException('Global navigation is missing.');
    }
    
    let currentLevel = [root];
    const allNodes = [root];

    for (let depth = 0; depth < maxDepth; depth++) {
      if (currentLevel.length === 0) break;

      // ONE query per level, regardless of node count
      const parentIds = currentLevel.map(n => n.id);
      const nextLevel = await this._navigationRepository.find({
        where: { parentId: In(parentIds) },
        relations: [
          'navigationType',
          'containerLayout',
          'containerStyle',
          'typographyStyle',
          'menu',
          'menu.containerLayout',
          'menu.containerStyle',
          'menu.typographyStyle'
        ]
      });

      if (nextLevel.length === 0) break;

      // Attach children to parents in memory
      const childrenMap = nextLevel.reduce((acc, node) => {
        acc[node.parentId] = acc[node.parentId] || [];
        acc[node.parentId].push(node);
        return acc;
      }, {});

      currentLevel.forEach(parent => {
        parent.children = childrenMap[parent.id] || [];
      });

      currentLevel = nextLevel;
      allNodes.push(...nextLevel);
    }

    return root;
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
   * Load nested navigations with permissions.
   * 
   * Process:
   * 1. Load root and user permissions.
   * 2. Initialize root and load all levels.
   * 3. Cleanup invalid nodes and setup user navigation permissions for request token.
   * 4. Create auth token with user navigation permissions.
   * 
   * @param userId The user id from the request.
   * @param userEmail The user email from the request.
   * @param maxDepth The maximum depth to load (default 8).
   * @returns Nested navigation tree with permissions and optional access token.
   */
  async loadNestedNavigations(
    userId: string,
    userEmail: string,
    maxDepth: number = 8,
  ) {
    // 1. Load root and user permissions
    const root = await this.loadRootNavigation();
    const userRoleNavigationPermissionsFormatted = await this.getUserRoleNavigationPermissionsFormatted(userId);

    // 2. Initialize root and load all levels
    this.initializeRootPermissions(root, userRoleNavigationPermissionsFormatted);
    const allLevels = await this.loadNavigationLevels(root, maxDepth, userRoleNavigationPermissionsFormatted);

    // 3. Cleanup invalid nodes and collect permissions in a single pass
    const userNavigationPermissions = this.cleanupAndCollectPermissions(allLevels);

    // 4. Create auth token with user navigation permissions.
    const payload = {
      sub: userId,
      userEmail: userEmail,
      userNavigationPermissions: userNavigationPermissions
    };
    const accessToken = await this._authService.getAccessToken(payload);
    
    return { navigation: root, access_token: accessToken };
  }

  /**
   * Load root navigation with all required relations.
   * 
   * @returns The root navigation entity.
   * @throws {BadRequestException} If root navigation is not found.
   */
  private async loadRootNavigation(): Promise<Navigation> {
    const rootId = '00000000-0000-0000-0000-000000000000';
    const root = await this._navigationRepository.findOne({
      where: { id: rootId },
      relations: [
        'navigationType',
        'containerLayout',
        'containerStyle',
        'typographyStyle',
        'menu',
        'menu.containerLayout',
        'menu.containerStyle',
        'menu.typographyStyle'
      ]
    });

    if (!root) {
      throw new BadRequestException('Global navigation is missing.');
    }

    return root;
  }

  /**
   * Initialize root navigation with empty children array and setup permissions.
   * 
   * @param root The root navigation node.
   * @param userRoleNavigationPermissions User's role navigation permissions.
   */
  private initializeRootPermissions(
    root: Navigation,
    userRoleNavigationPermissions: RoleNavigationPermission[]
  ): void {
    root.children = [];
    const navigationPermission = userRoleNavigationPermissions.find(
      obj => obj.navigationId === root.id
    )?.permission;

    if (navigationPermission) {
      root['permissionName'] = navigationPermission.name;
    }
  }

  /**
   * Load navigations level-by-level with on-the-fly permission setup.
   * 
   * Until depth or no more navigations:
   * 1. Load next level of navigations.
   * 2. Setup permissions on next level of navigations and build children map.
   * 3. Assign children to current level navigations.
   * 
   * @param root The root navigation.
   * @param maxDepth Maximum depth to load.
   * @param userRoleNavigationPermissions User's role navigation permissions.
   * @returns Array of levels containing navigations.
   */
  private async loadNavigationLevels(
    root: Navigation,
    maxDepth: number,
    userRoleNavigationPermissions: RoleNavigationPermission[]
  ): Promise<Navigation[][]> {
    let currentLevel = [root];
    const allLevels: Navigation[][] = [[root]];

    for (let depth = 0; depth < maxDepth; depth++) {
      if (currentLevel.length === 0) break;

      // 1. Load next level of navigations
      const parentIds = currentLevel.map(n => n.id);
      const nextLevel = await this._navigationRepository.find({
        where: { 
          parentId: In(parentIds),
          deletedDate: IsNull()
        },
        relations: [
          'navigationType',
          'containerLayout',
          'containerStyle',
          'typographyStyle',
          'menu',
          'menu.containerLayout',
          'menu.containerStyle',
          'menu.typographyStyle'
        ]
      });

      if (nextLevel.length === 0) break;

      // 2. Setup permissions on next level of navigations and build children map
      const childrenMap = this.buildChildrenMapWithPermissions(
        nextLevel,
        currentLevel,
        userRoleNavigationPermissions
      );

      // 3. Assign children to current level navigations
      currentLevel.forEach(parent => {
        parent.children = childrenMap[parent.id] || [];
      });

      currentLevel = nextLevel;
      allLevels.push(currentLevel);
    }

    return allLevels;
  }

  /**
   * Build children map with permission setup.
   * 
   * 1. Get parent's permission for inheritance.
   * 2. Setup permission for this navigation following the 4 permission cases.
   * 
   * @param nextLevel Nodes of the current level to process.
   * @param currentLevel Parent nodes of the next level.
   * @param userRoleNavigationPermissions User's role navigation permissions.
   * @returns Map of parent IDs to their children.
   */
  private buildChildrenMapWithPermissions(
    nextLevel: Navigation[],
    currentLevel: Navigation[],
    userRoleNavigationPermissions: RoleNavigationPermission[]
  ): Record<string, Navigation[]> {
    return nextLevel.reduce((acc, node) => {
      node.children = [];

      // 1. Get parent's permission for inheritance
      const parent = currentLevel.find(p => p.id === node.parentId);
      const parentPermission = parent?.['permissionName'];

      // 2. Setup permission for this node
      this.setupNodePermissions(node, parentPermission, userRoleNavigationPermissions);

      acc[node.parentId] = acc[node.parentId] || [];
      acc[node.parentId].push(node);

      return acc;
    }, {});
  }

  /**
   * Setup permission for a single node following the 4 permission inheritance cases.
   * 
   * Cases:
   * - Case 1: Node permission higher than parent → keep node permission
   * - Case 2: Node permission lower than parent → inherit parent permission
   * - Case 3: Node has permission, parent doesn't → keep node permission
   * - Case 4: Node has no permission, parent does → inherit parent permission
   * 
   * @param node The navigation node to setup permissions for.
   * @param parentPermission The parent's permission name (if any).
   * @param userRoleNavigationPermissions User's role navigation permissions.
   */
  private setupNodePermissions(
    node: Navigation,
    parentPermission: string | undefined,
    userRoleNavigationPermissions: RoleNavigationPermission[]
  ): void {
    let nodePermission = userRoleNavigationPermissions.find(
      obj => obj.navigationId === node.id
    )?.permission;

    if (nodePermission) {
      const parentPermissionObj = parentPermission
        ? userRoleNavigationPermissions.find(rnp => rnp.permission.name === parentPermission)?.permission
        : undefined;

      if (parentPermissionObj) {
        // Case 1: Node has permission and it's higher than parent
        if (nodePermission.priority < parentPermissionObj.priority) {
          node['permissionName'] = nodePermission.name;
        }
        // Case 2: Node has permission but parent permission is higher
        else {
          node['permissionName'] = parentPermissionObj.name;
          nodePermission = parentPermissionObj;
        }
      }
      // Case 3: Node has permission and parent has none
      else {
        node['permissionName'] = nodePermission.name;
      }
    }
    // Case 4: Node has no permission but parent does
    else {
      if (parentPermission) {
        node['permissionName'] = parentPermission;
      }
    }
  }

  /**
   * Iteratively cleanup invalid navigations and collect permissions in a single bottom-up pass.
   * 
   * Removes nodes that have neither valid permissions nor valid children.
   * Collects all valid nodes with permissions for token payload.
   * 
   * @param allLevels All navigation levels.
   * @returns Array of navigation permissions for valid nodes.
   */
  private cleanupAndCollectPermissions(allLevels: Navigation[][]): NavigationPermissions {
    const userNavigationPermissions: NavigationPermissions = [];

    const isNodeValid = (node: Navigation): boolean => {
      const hasValidPermission = node['permissionName'] &&
        (!node.isDisabled || node['permissionName'].includes('add'));
      const hasValidChildren = node.children && node.children.length > 0;
      return hasValidPermission || hasValidChildren;
    };

    // Bottom-up pass: cleanup and collect permissions
    for (let i = allLevels.length - 1; i > 0; i--) {
      const level = allLevels[i];
      for (let j = level.length - 1; j >= 0; j--) {
        const node = level[j];
        if (!isNodeValid(node)) {
          // Remove from parent's children
          const parentLevel = allLevels[i - 1];
          const parent = parentLevel.find(p => p.id === node.parentId);
          if (parent) {
            parent.children = parent.children.filter(c => c.id !== node.id);
          }
          level.splice(j, 1);
        }
        // Collect valid nodes with permissions on-the-fly
        else if (node['permissionName']) {
          userNavigationPermissions.push({
            navigationId: node.id,
            permissionName: node['permissionName'],
            navigationTypeName: node.navigationType.name
          });
        }
      }
    }

    // Also collect root if it has permissions
    const root = allLevels[0][0];
    if (root && root['permissionName']) {
      userNavigationPermissions.push({
        navigationId: root.id,
        permissionName: root['permissionName'],
        navigationTypeName: root.navigationType.name
      });
    }

    return userNavigationPermissions;
  }

  /**
   * Generate navigation relations until given depth.
   * 
   * @param depth The number of nested levels.
   * @param relations The existing set of relations.
   * @param order The existing TypeORM order property.
   * @param base The relation base.
   */
  private generateRelationsAndOrder(
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
   * If a user is assigned to multiple roles which share the same navigations
   * then we keep only the navigations with highest priviledge.
   * 
   * TODO: Rework to something more fluent and performant.
   * 
   * @param userId the id of the user.
   * @returns The user roleNavigationPermissions formatted.
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
   * - Case 1. Navigation permission found and it is higher than parent one - keep navigation permission.
   * - Case 2. Navigation permission found but parent permission is higher - navigation inherits parent navigation permission.
   * - Case 3. Navigation permission found and parent has no permission - keep navigation permission.
   * - Case 4. No navigation permission found but parent navigation permission found - navigation inherits parent navigation permission.
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
   * 1. Add audit data and save navigation.
   * 2. Assign style properties.
   * 3. If navigation is a menu button then create menu.
   * 
   * @param createNavigationDto The navigation to save.
   * @param userId The user id from request.
   * @returns The navigation saved.
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
   * 1. Get existing navigation from db.
   * 2. If parent has changed and old parent has no more children then delete his menu.
   * 3. Add audit data and update navigation.
   * 
   * @param id The navigation id.
   * @param updateNavigationDto The navigation properties to update.
   * @param userId The user id from request.
   * @returns An UpdateResponse type object.
   * @throws {NotFoundException} If navigation id is not found in database.
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
   * 1. Retrieve recursively children and related menu to delete.
   * 2. Soft delete navigation, his descendants and delete related style properties.
   * 3. Check if parent navigation has a menu and remains without children. If yes retrieve menu to delete.
   * 4. Delete menus retrieved on step 2 & 4 and delete style properties.
   * 5. Delete roleNavigationPermissions associated to navigations deleted.
   * 6. Return number of navigation soft deleted.
   * 
   * @param navigation The navigation to delete.
   * @param userId The user id from request.
   * @returns The Array of navigations that have been soft deleted.
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
