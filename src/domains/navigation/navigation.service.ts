import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Navigation } from './entities/navigation.entity';
import { In, IsNull, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { RoleNavigationPermission } from '../role-navigation-permission/entities/role-navigation-permission.entity';
import { AuthService } from 'src/core/auth/auth.service';
import { MenuService } from '../menu/menu.service';
import { NavigationType } from '../navigation-type/entities/navigation-type.entity';
import { NavigationPermissions } from 'src/core/models/navigation-permissions.interface';
import { ContainerStyleService } from '../container-style/container-style.service';
import { TypographyStyleService } from '../typography-style/typography-style.service';
import { ContainerLayoutService } from '../container-layout/container-layout.service';
import { v4 as uuidv4 } from 'uuid';

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
    @Inject(forwardRef(() => MenuService))
    private _menuService: MenuService,
    @Inject(forwardRef(() => ContainerLayoutService))
    private _containerLayoutService: ContainerLayoutService,
    private _containerStyleService: ContainerStyleService,
    private _typographyStyleService: TypographyStyleService,
  ) {}

  /**
   * Find all flat navigations with their navigationType, filtered by user permission.
   * 
   * @param userNavigationPermissions The user navigation permissions from request.
   * @returns The array of navigations.
   */
  async findAllNavigations(userNavigationPermissions: NavigationPermissions) {
    const userNavigationGroupIds = userNavigationPermissions.map<string>(
      userNavigationPermission => userNavigationPermission.navigationGroupId
    );

    return await this._navigationRepository.find({
      where: { 
        groupId: In(userNavigationGroupIds),
        isDraft: true,
        deletedDate: IsNull()
      },
      relations: ['navigationType', 'parent'],
      order: { displayLabel: 'ASC' }
    });
  }

  /**
   * Load nested navigations with permissions.
   * 
   * Process:
   * 1. Load user navigation permissions.
   * 2. Initialize root and load all levels.
   * 3. Cleanup invalid nodes and setup user navigation permissions for request token.
   * 4. Create auth token with user navigation permissions.
   * 
   * @param userId The user id from the request.
   * @param userEmail The user email from the request.
   * @param maxDepth The maximum depth to load.
   * @returns Nested navigation tree with permissions and optional access token.
   */
  async loadNestedNavigations(
    userId: string,
    userEmail: string,
    maxDepth: number
  ) {
    // 1. Load root user permissions
    const userRoleNavigationPermissionsFormatted = await this.getUserRoleNavigationPermissionsFormatted(userId);

    // 2. Initialize root and load all levels
    const root = await this.loadRootNavigation(userRoleNavigationPermissionsFormatted);
    await this.loadNavigationLevels(root, maxDepth, userRoleNavigationPermissionsFormatted);

    // 3. Cleanup invalid nodes and collect permissions in a single pass
    const userNavigationPermissions = this.cleanupAndCollectPermissions(root);

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
   * If user has edit permission on root then load 'draft' root record else load 'publish' root record.
   * 
   * @returns The root navigation entity.
   * @throws {BadRequestException} If root navigation is not found.
   */
  private async loadRootNavigation(
    userRoleNavigationPermissions: RoleNavigationPermission[]
  ): Promise<Navigation> {
    const rootGroupId = '00000000-0000-0000-0000-000000000000';
    const rootPublishRecordId = '00000000-0000-0000-0000-000000000000';
    const rootDraftRecordId = '11111111-1111-1111-1111-111111111111';

    const rootPermission = userRoleNavigationPermissions.find(
      obj => obj.navigationGroupId === rootGroupId
    )?.permission;

    const rootId = rootPermission?.name.includes('edit') ? rootDraftRecordId : rootPublishRecordId;
    
    const root = await this._navigationRepository.findOne({
      where: { id: rootId },
      relations: [
        'navigationType',
        'menu',
        'menu.containerLayout',
        'menu.containerStyle',
        'menu.typographyStyle'
      ]
    });

    if (!root) {
      throw new BadRequestException('Global navigation is missing.');
    }

    if (rootPermission) {
      root['permissionName'] = rootPermission.name;
    }
    root['level'] = 0;
    root.children = [];

    return root;
  }

  /**
   * Load navigations level-by-level with on-the-fly permission setup.
   * 
   * Until depth or no more navigations:
   * 1. Load next level of navigations.
   * 2. Setup permissions on next level of navigations.
   * 3. Assign next level as children of current level navigations.
   * 
   * @param root The root navigation.
   * @param maxDepth Maximum depth to load.
   * @param userRoleNavigationPermissions User's role navigation permissions.
   */
  private async loadNavigationLevels(
    root: Navigation,
    maxDepth: number,
    userRoleNavigationPermissions: RoleNavigationPermission[]
  ) {
    let currentLevel = [root];

    for (let depth = 0; depth < maxDepth; depth++) {
      if (currentLevel.length === 0) break;

      // 1. Load next level of navigations
      const parentGroupIds = currentLevel.map(n => n.groupId);
      const nextLevel = await this._navigationRepository.find({
        where: { 
          parentGroupId: In(parentGroupIds),
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

      // 2. Setup permissions on next level of navigations and build Record<parentGroupId, children>.
      const childrenMap = this.buildChildrenMapWithPermissions(
        nextLevel,
        currentLevel,
        userRoleNavigationPermissions,
        depth
      );

      // 3. Assign next level to children of current level navigations.
      currentLevel.forEach(parent => {
        parent['level'] = depth;
        parent.children = childrenMap[parent.groupId] || [];
      });

      currentLevel = nextLevel;
    }
  }

  /**
   * Build children map with permission setup.
   * 
   * 1. Get parent's permission for inheritance.
   * 2. Setup permission for this navigation following the 4 permission cases.
   * 3. if view permission then keep 'publish' record only, if edit permission then keep 'draft' record only.
   * 
   * @param nextLevel Nodes to process.
   * @param currentLevel Parent nodes. Needed to get parent permissions.
   * @param userRoleNavigationPermissions User's role navigation permissions.
   * @returns Map of parent IDs to their children.
   */
  private buildChildrenMapWithPermissions(
    nextLevel: Navigation[],
    currentLevel: Navigation[],
    userRoleNavigationPermissions: RoleNavigationPermission[],
    depth
  ): Record<string, Navigation[]> {
    return nextLevel.reduce((acc, node) => {
      node.children = [];
      node['level'] = depth + 1;
      // 1. Get parent's permission for inheritance 
      const parent = currentLevel.find(p => p.groupId === node.parentGroupId);
      const parentPermission = parent?.['permissionName'];

      // 2. Setup permission for this node
      this.setupNodePermissions(node, parentPermission, userRoleNavigationPermissions);

      acc[node.parentGroupId] = acc[node.parentGroupId] || [];

      //3. Keep only 'draft' or 'publish' record
      if (
        (node['permissionName']?.includes('edit') && node.isDraft) ||
        (!node['permissionName']?.includes('edit') && !node.isDraft)
      ) {
        acc[node.parentGroupId].push(node);
      }

      return acc;
    }, {});
  }

  /**
   * Assign permission name to a single node following the 4 permission inheritance cases.
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
      obj => obj.navigationGroupId === node.groupId
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
   * Iteratively cleanup invalid navigations and collect permissions at the same time.
   * 
   * Removes nodes that have no valid permissions an no children with valid permissions.
   * Collects all valid nodes with permissions for token payload.
   * 
   * @param root The root navigation.
   * @returns Array of navigation permissions for valid nodes.
   */
  private cleanupAndCollectPermissions(root: Navigation): NavigationPermissions {
    const userNavigationPermissions: NavigationPermissions = [];

    const isViewOnlyAndDisabled = (node: Navigation): boolean => {
      return !node['permissionName']?.includes('edit') && node.isDisabled;
    };

    // Post-order prune: keep node if it has a valid permission or any descendant does.
    const prune = (node: Navigation): boolean => {
      if (!node) return false;
      if (!node.children) node.children = [];

      // Recurse into children first
      node.children = node.children.filter(child => prune(child));

      // Collect permission only if it's a valid permission (not view-only disabled)
      const hasOwnValidPermission = !!node['permissionName'] && !isViewOnlyAndDisabled(node);
      if (hasOwnValidPermission) {
        userNavigationPermissions.push({
          navigationGroupId: node.groupId,
          permissionName: node['permissionName'],
          navigationTypeName: node.navigationType?.name
        });
      }

      // Node is kept if it has a valid permission or any child was kept
      return hasOwnValidPermission || node.children.length > 0;
    };

    prune(root);

    return userNavigationPermissions;
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
   * @returns The distinct role navigation permissions associated to the user.
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
      (acc[item.navigationGroupId] ||= []).push(item);
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
   * Save navigation with default style.
   * 
   * 1. Add draft and audit data and save navigation.
   * 3. Assign style properties.
   * 4. If navigation is a menu button then create menu.
   * 
   * @param createNavigationDto The navigation to save.
   * @param userId The user id from request.
   * @returns The navigation saved.
   */
  async saveNavigation(
    createNavigationDto: CreateNavigationDto,
    userId: string,
  ): Promise<Navigation> {
    /* 1 */
    createNavigationDto['isDraft'] = true;
    createNavigationDto['groupId'] = uuidv4();
    createNavigationDto['unpublishedChanges'] = ['all'];
    createNavigationDto['createdBy'] = userId;
    createNavigationDto['createdDate'] = new Date();
    createNavigationDto['updatedBy'] = userId;
    createNavigationDto['updatedDate'] = new Date();

    const menuButtonNavigationType = await this._navigationTypeRepository.findOne({
      where: { name: 'menu-button' }
    });
    if (createNavigationDto.navigationTypeId === menuButtonNavigationType!.id) {
      createNavigationDto['unpublishedChanges'].push('menu');
    }
    const navigationSaved = await this._navigationRepository.save(createNavigationDto);

    /* 2. */
    await this._containerLayoutService.createObjectContainerLayout({ refId: navigationSaved.id });
    await this._containerStyleService.createObjectDefaultContainerStyle(navigationSaved.id);
    await this._typographyStyleService.createObjectDefaultTypographyStyle(navigationSaved.id);

    /* 3. */
    if (navigationSaved.navigationTypeId === menuButtonNavigationType!.id) {
      const menuSaved = await this._menuService.createMenu(navigationSaved.id);
      await this._containerLayoutService.createObjectContainerLayout({ refId: menuSaved.id });
      await this._containerStyleService.createObjectDefaultContainerStyle(menuSaved.id);
      await this._typographyStyleService.createObjectDefaultTypographyStyle(menuSaved.id);
    }

    return navigationSaved;
  }

  /**
   * Update navigation.
   * 
   * 1. Get existing navigation from db.
   * 2. Push properties to 'unpublishedChanges' keeping uniqueness
   * 3. If parent has changed and old parent has no more children then delete his menu.
   * 4. Add audit data and update navigation.
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

    /* 2 */ 
    const setOfKeys = new Set(dbNavigation.unpublishedChanges);
    setOfKeys.add('navigation');
    updateNavigationDto['unpublishedChanges'] = [...setOfKeys];
    
    /* 3. */
    if ('parentGroupId' in updateNavigationDto && updateNavigationDto.parentGroupId !== dbNavigation.parentGroupId) {
      const oldParentNavigation = await this._navigationRepository.findOne({
        relations: ['children', 'menu'],
        where: { 
          id: dbNavigation.parentGroupId,
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

    /* 4. */
    updateNavigationDto["updatedBy"] = userId;
    updateNavigationDto["updatedDate"] = new Date();
    return await this._navigationRepository.update(id, updateNavigationDto);
  }

  /**
   * Update Array of navigations.
   * 
   * @param navigations The array of navigations.
   * @param userId The user id from request.
   * @returns The array of navigations saved.
   */
  async updateNavigations(
    navigations: Array<{
      groupId: string;
      order: number;
    }>,
    userId: string,
  ): Promise<{ message: string }> {
    await Promise.all(
      navigations.map(async (navigation) => {
        const navigationToUpdate = {
          ...navigation,
          updatedBy: userId,
          updatedDate: new Date(),
        };

        this._navigationRepository.update(
          { groupId: navigation.groupId },
          navigationToUpdate,
        );
      }),
    );

    return { message: 'Navigations updated successfully.' };
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
    /* 1. Retrieve recursively children and related menu to delete.*/
    const navigationGroupIds: Array<string> = [];
    const navigationRecordsToDelete: Array<Pick<Navigation, 'id' | 'deletedBy' | 'deletedDate'>> = [];
    const menuIdsToDelete: Array<string> = [];

    /* declare method to retrieve navigations and menus to delete */
    const getDeepNavigationIds = async (navigation: Navigation) => {

      // get 'draft' and 'publish' record for given navigation group id and store group id.
      const draftAndPublishNavigations = await this._navigationRepository.find({
        take: 2,
        relations: ['menu'],
        where: { groupId: navigation.groupId }
      });
      navigationGroupIds.push(navigation.groupId);

      // store nav and menu records to delete for 'draft' and 'publish' record
      for (const nav of draftAndPublishNavigations) {
        navigationRecordsToDelete.push({
          id: nav.id,
          deletedBy: userId,
          deletedDate: new Date()
        });

        if (nav.menu) {
          menuIdsToDelete.push(nav.menu.id);
        }

        //apply process for children
        if (nav.children) {
          for (const child of nav.children) {
              await getDeepNavigationIds(child);
          }
        }
      };
    } 
    /* call method */
    await getDeepNavigationIds(navigation);

    /* 2. Soft delete navigations, descendants and delete related style properties. */
    const navigationsSoftDeleted = await this._navigationRepository.save(navigationRecordsToDelete);
    for (const navigation of navigationRecordsToDelete) {
      await this._containerLayoutService.deleteByRefId(navigation.id);
      await this._containerStyleService.deleteByRefId(navigation.id);
      await this._typographyStyleService.deleteByRefId(navigation.id);
    }
    
    /* 3. Check if parent navigation has a menu and remains without children. If yes retrieve menu to delete. */
    const parentNavigationDraftAndPublishRecords = await this._navigationRepository.find({
      take: 2,
      where: { 
        groupId: navigation.parentGroupId,
        deletedDate: IsNull(),
      },
      relations: ['children', 'menu']
    });

    if (
      parentNavigationDraftAndPublishRecords
      && parentNavigationDraftAndPublishRecords[0].children.filter(obj => !obj.deletedDate).length === 0
    ) {
      for (const parentNavigation of parentNavigationDraftAndPublishRecords) {
        if (parentNavigation.menu) {
          menuIdsToDelete.push(parentNavigation.menu.id);
        }
      }
    }

    /* 4. Delete menus retrieved on step 2 & 4 and delete style properties. */
    for (const id of menuIdsToDelete) {
      await this._menuService.remove(id);
      await this._containerLayoutService.deleteByRefId(id);
      await this._containerStyleService.deleteByRefId(id);
      await this._typographyStyleService.deleteByRefId(id);
    }

    /* 5. Delete roleNavigationPermissions associated to navigations deleted. */
    const roleNavigationsPermissions = await this._roleNavigationPermissionRepository.find({
      where: { navigationGroupId: In(navigationGroupIds) }
    })
    for (let roleNavigationsPermission of roleNavigationsPermissions) {
      roleNavigationsPermission.deletedBy = userId;
      roleNavigationsPermission.deletedDate = new Date();
    }
    await this._roleNavigationPermissionRepository.save(roleNavigationsPermissions);
    
    /* 6. Return number of navigation soft deleted. */
    return { affected: navigationsSoftDeleted.length }
  }


  /**
   * Publish navigation.
   * 
   * CASE 1 - Only draft navigation exists:
   * - copy draft record and save it as published record
   * - copy style and menu relations of draft record and create relations of published record
   * - update draft record to mention no changes is pending to be published
   * 
   * CASE 2 - Draft and publish navigations exist:
   * - copy draft record properties into published record
   * - copy unpublishedChanges relations into relations of published record
   * - update draft record to mention no changes is pending to be published
   * 
   * If navigation has a menu, then we publish automatically his menu and relations.
   * 
   * @param navigationGroupId The navigation group id.
   * @param userId The user id of the request.
   * @throws {NotFoundException} If no navigation found for this group id.
   */
  async publishNavigation(
    navigationGroupId: string,
    userId: string
  ): Promise<{ message: string; }> {
    const navigations = await this.getNavigationsByGroupId(navigationGroupId);

    /* CASE 1 */
    if (navigations.length === 1) {
      let { id: _, containerLayout, containerStyle, typographyStyle, menu, ...navigationPublishedRecord } = navigations[0];
      navigationPublishedRecord.isDraft = false;
      navigationPublishedRecord.unpublishedChanges = [];
      navigationPublishedRecord.createdBy = userId;
      navigationPublishedRecord.createdDate = new Date();
      navigationPublishedRecord.updatedBy = navigationPublishedRecord.createdBy;
      navigationPublishedRecord.updatedDate = navigationPublishedRecord.createdDate;
      const navigationPublishedRecordId = (await this._navigationRepository.save(navigationPublishedRecord)).id;
      
      let { id: __, ...containerLayoutPublishRecord } = navigations[0].containerLayout;
      containerLayoutPublishRecord.refId = navigationPublishedRecordId;
      await this._containerLayoutService.createObjectContainerLayout(containerLayoutPublishRecord);

      let { id: ___, ...containerStylePublishRecord } = navigations[0].containerStyle;
      containerStylePublishRecord.refId = navigationPublishedRecordId;
      await this._containerStyleService.createObjectContainerStyle(containerStylePublishRecord);

      let { id: ____, ...typographyStylePublishRecord } = navigations[0].typographyStyle;
      typographyStylePublishRecord.refId = navigationPublishedRecordId;
      await this._typographyStyleService.createObjectTypographyStyle(typographyStylePublishRecord);


      if (navigations[0].menu) {
        const menuPublishedRecordId = (await this._menuService.createMenu(navigationPublishedRecordId, navigations[0].menu.isVertical)).id;
        
        let { id: _, ...menuContainerLayoutPublishRecord } = navigations[0].menu.containerLayout;
        menuContainerLayoutPublishRecord.refId = menuPublishedRecordId;
        await this._containerLayoutService.createObjectContainerLayout(menuContainerLayoutPublishRecord);

        let { id: __, ...menuContainerStylePublishRecord } = navigations[0].menu.containerStyle;
        menuContainerStylePublishRecord.refId = menuPublishedRecordId;
        await this._containerStyleService.createObjectContainerStyle(menuContainerStylePublishRecord);
      }

      await this._navigationRepository.update(navigations[0].id, { unpublishedChanges: [] });
    }

    /* CASE 2 */
    else {
      const navigationPublishedRecord = navigations.find(obj => obj.isDraft === false)!;
      const navigationDraftRecord = navigations.find(obj => obj.isDraft === true)!;

      for (let relation of navigationDraftRecord!.unpublishedChanges) {
        if (relation === 'containerLayout') {
          const { id, refId, ...containerLayoutPropertiesToUpdate} = navigationDraftRecord.containerLayout;
          await this._containerLayoutService.updateByRefId(navigationPublishedRecord.id, containerLayoutPropertiesToUpdate);
        }

        if (relation === 'containerStyle') {
          const { id, refId, ...containerStylePropertiesToUpdate} = navigationDraftRecord.containerStyle;
          await this._containerStyleService.updateByRefId(navigationPublishedRecord.id, containerStylePropertiesToUpdate);
        }

        if (relation === 'typographyStyle') {
          const { id, refId, ...typographyStylePropertiesToUpdate} = navigationDraftRecord.typographyStyle;
          await this._typographyStyleService.updateByRefId(navigationPublishedRecord.id, typographyStylePropertiesToUpdate);
        }

        if (relation === 'menu' && navigationDraftRecord.menu) {
          // if no menu for publish record, we have to create it
          if (!navigationPublishedRecord.menu) {
            const menuPublishedRecordId = (await this._menuService.createMenu(navigationPublishedRecord.id, navigationDraftRecord.menu.isVertical)).id;

            let { id: _, ...menuContainerLayoutPublishRecord } = navigationDraftRecord.menu.containerLayout;
            menuContainerLayoutPublishRecord.refId = menuPublishedRecordId;
            await this._containerLayoutService.createObjectContainerLayout(menuContainerLayoutPublishRecord);

            let { id: __, ...menuContainerStylePublishRecord } = navigationDraftRecord.menu.containerStyle;
            menuContainerStylePublishRecord.refId = menuPublishedRecordId;
            await this._containerStyleService.createObjectContainerStyle(menuContainerStylePublishRecord);
          }
          // if menu exists for publish record, we have to update it
          else {
            const { id: _, refId: _r, ...containerLayoutPropertiesToUpdate } = navigationDraftRecord.menu.containerLayout;
            await this._containerLayoutService.updateByRefId(navigationPublishedRecord.menu.id, containerLayoutPropertiesToUpdate);

            const { id: __, refId: _r2, ...containerStylePropertiesToUpdate } = navigationDraftRecord.menu.containerStyle;
            await this._containerStyleService.updateByRefId(navigationPublishedRecord.menu.id, containerStylePropertiesToUpdate);
          }
        }
      }

      let {
        id, isDraft, createdDate, createdBy, menu, containerLayout, containerStyle, typographyStyle,
        ...navigationPropertiesToUpdate 
      } = navigationDraftRecord!;

      navigationPropertiesToUpdate.unpublishedChanges = [];
      navigationPropertiesToUpdate.updatedBy = userId;
      navigationPropertiesToUpdate.updatedDate = new Date();
      await this._navigationRepository.update(navigationPublishedRecord.id, navigationPropertiesToUpdate);
      await this._navigationRepository.update(navigationDraftRecord.id, { unpublishedChanges: []});
    }

    return { message: 'Navigation published successfully.' };
  }

  /**
   * Mark navigation as dirty by adding relations to 'unpublishedChanges' array.
   * 
   * 1. Add relations to 'unpublishedChanges' keeping uniqueness.
   * 2. Update navigation with new 'unpublishedChanges' array.
   * 
   * @param navigation The navigation to mark as dirty.
   * @param relations The list of relations that have changed.
   */
  async markDirty(navigation: Navigation, relations: Array<string>) {
    /* 1. */
    const setOfFields = new Set(navigation.unpublishedChanges);
    relations.forEach(relation => setOfFields.add(relation));

    /* 2. */
    await this._navigationRepository.update(
      navigation.id,
      { unpublishedChanges: [...setOfFields] },
    );
  }

  /**
   * Retrieve navigations by their group id.
   *  
   * @param navigationGroupId The navigation group id.
   * @returns A promise of an array of 1 or 2 navigations.
   * @throws {NotFoundException} If no navigations found for this group id.
   */
  async getNavigationsByGroupId(navigationGroupId: string) {
    const navigations = await this._navigationRepository.find({
      relations: [
        'containerLayout',
        'containerStyle',
        'typographyStyle',
        'menu',
        'menu.containerLayout',
        'menu.containerStyle',
        'menu.typographyStyle',
      ],
      take: 2, //only 2 navigations by groupId so improve query performance
      where: {
        groupId: navigationGroupId,
        deletedDate: IsNull()
      }
    });

    if (navigations.length === 0) {
      throw new NotFoundException(`No navigations found for groupId: ${navigationGroupId}`);
    }

    return navigations;
  }


  /**
   * Cancel navigation changes and return it.
   * 
   * 1. Get navigation draft and published versions from database.
   * 2. Update draft navigation relations (style and menu) with published ones.
   * 3. Update draft navigation properties with published ones.
   * 4. Return draft navigation updated.
   * 
   * @param navigationGroupId The navigation group id.
   * @param userId The user id from request.
   * @return A promise of the draft navigation where changes have been cancelled.
   * @throws {BadRequestException} if draft record or published record is not found.
   */
  async cancelNavigationChanges(
    navigationGroupId: string,
    userId: string
  ): Promise<Navigation | null> {
    /* 1. */
    const navigations = await this.getNavigationsByGroupId(navigationGroupId);
    const navigationPublishedRecord = navigations.find(obj => obj.isDraft === false);
    const navigationDraftRecord = navigations.find(obj => obj.isDraft === true);
    if (!navigationDraftRecord) {
      throw new BadRequestException('Navigation draft record not found.');
    }
    if (!navigationPublishedRecord) {
      throw new BadRequestException('An item which has never been published cannot be canceled. You have to delete it.');
    }

    /* 2. */
    for (let relation of navigationDraftRecord!.unpublishedChanges) {
      if (relation === 'containerLayout') {
        const { id, refId, ...containerLayoutPropertiesToUpdate} = navigationPublishedRecord.containerLayout;
        await this._containerLayoutService.updateByRefId(navigationDraftRecord.id, containerLayoutPropertiesToUpdate);
      }

      if (relation === 'containerStyle') {
        const { id, refId, ...containerStylePropertiesToUpdate} = navigationPublishedRecord.containerStyle;
        await this._containerStyleService.updateByRefId(navigationDraftRecord.id, containerStylePropertiesToUpdate);
      }

      if (relation === 'typographyStyle') {
        const { id, refId, ...typographyStylePropertiesToUpdate} = navigationPublishedRecord.typographyStyle;
        await this._typographyStyleService.updateByRefId(navigationDraftRecord.id, typographyStylePropertiesToUpdate);
      }

      if (relation === 'menu' && navigationDraftRecord.menu && navigationPublishedRecord.menu) {
        const { id: _, refId: _r, ...containerLayoutPropertiesToUpdate } = navigationPublishedRecord.menu.containerLayout;
        await this._containerLayoutService.updateByRefId(navigationDraftRecord.menu.id, containerLayoutPropertiesToUpdate);

        const { id: __, refId: _r2, ...containerStylePropertiesToUpdate } = navigationPublishedRecord.menu.containerStyle;
        await this._containerStyleService.updateByRefId(navigationDraftRecord.menu.id, containerStylePropertiesToUpdate);
      }
    }

    /* 3. */
    let {
      id, isDraft, createdDate, createdBy, menu, containerLayout, containerStyle, typographyStyle,
      ...navigationPropertiesToUpdate 
    } = navigationPublishedRecord;
    navigationPropertiesToUpdate.unpublishedChanges = [];
    navigationPropertiesToUpdate.updatedBy = userId;
    navigationPropertiesToUpdate.updatedDate = new Date();
    await this._navigationRepository.update(navigationDraftRecord.id, navigationPropertiesToUpdate);

    /* 4. */
    return this._navigationRepository.findOne({
      where: { id: navigationDraftRecord.id },
      relations: [
        'containerLayout',
        'containerStyle',
        'typographyStyle',
        'menu',
        'menu.containerLayout',
        'menu.containerStyle'
      ]
    });    
  }
}
