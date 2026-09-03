import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { UpdateNavigationDto } from "./dto/update-navigation.dto";
import { IsNull, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Navigation } from "./entities/navigation.entity";
import { NavigationType } from "../navigation-type/entities/navigation-type.entity";
import { NavigationPermissions } from "src/core/models/navigation-permissions.interface";
import { CreateNavigationDto } from "./dto/create-navigation.dto";

@Injectable()
export class NavigationValidatorService {

  constructor(
    @InjectRepository(Navigation)
    private _navigationRepository: Repository<Navigation>,
    @InjectRepository(NavigationType)
    private _navigationTypeRepository: Repository<NavigationType>,
  ) {}


  /**
   * Valid permission to add navigation.
   * 
   * @param createNavigationDto The navigation.
   * @param userNavigationPermissions The user navigation permission from request.
   * @throws {ForbiddenException} If user doesn't have 'edit' permission on parent.
   */
  validAddPermission(
    createNavigationDto: CreateNavigationDto,
    userNavigationPermissions: NavigationPermissions
  ) {
    if (
      !userNavigationPermissions.find(obj => 
        obj.navigationGroupId === createNavigationDto.parentGroupId && obj.permissionName.includes('edit')
      )
    ) {
      throw new ForbiddenException();
    }
  }

  /**
   * Valid permission to edit navigation.
   * 
   * @param id The navigation id.
   * @param userNavigationPermissions The user navigation permissions from the request.
   * @param updateNavigationDto The navigation properties to update.
   * @throws {ForbiddenException} If user doesn't have 'edit' permission on navigation.
   * @throws {ForbiddenException} If parentGroupId is in the request and user doesn't have 'edit' permisson on it.
   * @throws {NotFoundException} If navigation id is not found in database.
   */
  async validEditPermission(
    id: string,
    updateNavigationDto: UpdateNavigationDto,
    userNavigationPermissions: NavigationPermissions
  ) {
    const dbNavigation = await this._navigationRepository.findOne({
      where: { id: id }
    });
    if (!dbNavigation) {
      throw new NotFoundException(`Navigation with id ${id} doesn't exist.`);
    }

    if (!dbNavigation.isDraft) {
      throw new ForbiddenException(`'Publish' record cannot be edited.`);
    }

    if (
      !userNavigationPermissions.find(
        obj => obj.navigationGroupId === dbNavigation.groupId && obj.permissionName.includes('edit')
      )
    ) {
      throw new ForbiddenException();
    }

    if ('parentGroupId' in updateNavigationDto && updateNavigationDto.parentGroupId !== dbNavigation.parentGroupId) {
      if (
        !userNavigationPermissions.find(obj => 
        obj.navigationGroupId === updateNavigationDto.parentGroupId && obj.permissionName.includes('edit')
      )) {
        throw new ForbiddenException();
      }
    }

    return dbNavigation;
  }

  /**
   * Valid permission to edit array of navigation.
   * 
   * @param navigations The array of navigation to update.
   * @param userNavigationPermissions The user navigation permissions from request.
   * @throws {ForbiddenException} If user doesn't have edit permission on one of the navigations.
   */
  validEditPermissionOnArrayOfNavigations(
    navigations: Array<Navigation>,
    userNavigationPermissions: NavigationPermissions
  ) {
    navigations.forEach(navigation => {
      if (
        !userNavigationPermissions.find(obj =>
          obj.navigationGroupId === navigation.groupId && obj.permissionName.includes('edit')
        )
      ) {
        throw new ForbiddenException();
      }
    });
  }

  /**
   * Valid permission to delete navigation.
   * 
   * @param navigation The navigation to delete.
   * @param userNavigationPermissions The user navigation permissions from the request.
   * @throws {ForbiddenException} If user doesn't have delete permission on navigation 
   * @throws {BadRequestException} If navigation is global navigation.
   */
  validDeletePermission(
    navigation: Navigation,
    userNavigationPermissions: NavigationPermissions
  ) {
    if (
      !userNavigationPermissions.find(obj => 
        obj.navigationGroupId === navigation.groupId && obj.permissionName.includes('delete')
      )
    ) {
      throw new ForbiddenException();
    }

    if (navigation.name === 'global') {
      throw new BadRequestException('Global navigation cannot be deleted.');
    }
  }

  /**
   * Valid navigation business rules.
   * 
   * @param navigationDto The navigation to insert or update.
   * @param dbNavigation The navigation from database (optional).
   * @throws {NotFoundException} If `navigationDto.parentGroupId` is not found in the database.
   * @throws {NotFoundException} If `navigationDto.navigationTypeId` is not found in the database.
   * @throws {BadRequestException} If `navigationDto` type is a button and parent is not a menu or a redirect-button.
   * @throws {BadRequestException} If `navigationDto` type is a component and parent is not a dialog-button or a redirect-button without nav bar.
   * @throws {BadRequestException} If `navigationDto.name` is already used by sister navigations.
   * @throws {BadRequestException} If `navigationDto.parentGroupId` is equal to `navigationGroupId`.
   * @throws {BadRequestException} If `navigationDto` parent is found in the descendants of navigation to update.
   * @throws {BadRequestException} If `navigationDto.showIconOnly` is true and `navigationDto.icon` is empty.
   */
  async validNavigationDto(
    navigationDto: UpdateNavigationDto,
    dbNavigation?: Navigation
  ) {
    let parentNavigation: Navigation | null = null;
    if (navigationDto.parentGroupId) {
      parentNavigation = await this._navigationRepository.findOne({
        where: {
          groupId: navigationDto.parentGroupId,
          deletedDate: IsNull(),
        },
        relations: [
          'navigationType',
          'menu',
          'children'
        ]
      });
    
      if (!parentNavigation) {
        throw new NotFoundException(`Parent with group id ${navigationDto.parentGroupId} doesn't exist.`)
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
        const sisterNavigations = parentNavigation.children.filter(child => child.groupId !== dbNavigation?.groupId);
        if (sisterNavigations?.find(navigation => navigation.name ===  navigationDto['name'])) {
          throw new BadRequestException('A sister navigation has already this name.');
        }
      }

      if (dbNavigation) {
        if (dbNavigation.groupId === navigationDto.parentGroupId) {
          throw new BadRequestException('Parent cannot be same navigation');
        }

        await this.checkIfIsADescendant(dbNavigation.groupId, navigationDto.parentGroupId);
      }

      if (navigationDto.showIconOnly && !navigationDto.icon) {
        throw new BadRequestException(`"Show icon only" can't be true if there is no icon.`);
      }
      
      //TODO: Valid and external link input based on on nav type
    }

    return parentNavigation;
  }

  /**
   * Check if given navigation is in descendants of other navigation.
   * 
   * @param navigationGroupId The navigation with descendants.
   * @param parentGroupId The navigation to check.
   */
  async checkIfIsADescendant(navigationGroupId: string, parentGroupId: string) {

    const rows = await this._navigationRepository.query(
      `
      WITH RECURSIVE descendants AS (
        SELECT "groupId"
        FROM ${process.env.DB_SCHEMA}.navigation
        WHERE "parentGroupId" = $1
        UNION ALL
        SELECT n."groupId"
        FROM ${process.env.DB_SCHEMA}.navigation n
        JOIN descendants d ON n."parentGroupId" = d."groupId"
      )
      SELECT 1
      FROM descendants
      WHERE "groupId" = $2
      LIMIT 1
      `,
      [navigationGroupId, parentGroupId],
    );

    if (rows.length) {
      throw new BadRequestException('Parent cannot be a descendant');
    }
  }

  /**
   * Valid permission to publish navigation.
   * 
   * User must have 'edit' permission on the navigation to publish it.
   * 
   * @param navigationGroupId The navigation group id to publish.
   * @param userNavigationPermissions The user's navigation permissions.
   */
  validPublishPermission(
    navigationGroupId: string,
    userNavigationPermissions: NavigationPermissions
  ) {
    if (
      !userNavigationPermissions.find(obj => 
        obj.navigationGroupId === navigationGroupId && obj.permissionName.includes('edit')
      )
    ) {
      throw new ForbiddenException();
    }
  }

}