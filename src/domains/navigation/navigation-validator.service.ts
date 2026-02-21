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
   * @throws {ForbiddenException} If user doesn't have 'add' permission on parent.
   */
  validAddPermission(
    createNavigationDto: CreateNavigationDto,
    userNavigationPermissions: NavigationPermissions
  ) {
    if (
      !userNavigationPermissions.find(obj => 
        obj.navigationId === createNavigationDto.parentId && obj.permissionName.includes('add')
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
   * @throws {ForbiddenException} If parentId is in the request and user doesn't have 'add' permisson on it.
   * @throws {NotFoundException} If navigation id is not found in database.
   */
  async validEditPermission(
    id: string,
    updateNavigationDto: UpdateNavigationDto,
    userNavigationPermissions: NavigationPermissions
  ) {
    if (
      !userNavigationPermissions.find(
        obj => obj.navigationId === id && obj.permissionName.includes('edit')
      )
    ) {
      throw new ForbiddenException();
    }

    const dbNavigation = await this._navigationRepository.findOne({
      where: { id: id }
    });
    if (!dbNavigation) {
      throw new NotFoundException();
    }

    if ('parentId' in updateNavigationDto && updateNavigationDto.parentId !== dbNavigation.parentId) {
      if(
        !userNavigationPermissions.find(obj => 
        obj.navigationId === updateNavigationDto.parentId && obj.permissionName.includes('add')
      )) {
        throw new ForbiddenException();
      }
    }
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
          obj.navigationId === navigation.id && obj.permissionName.includes('edit')
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
   * @throws {ForbiddenException} If user doesn't have delete permission on navigation or
   * if navigation is global one.
   */
  validDeletePermission(
    navigation: Navigation,
    userNavigationPermissions: NavigationPermissions
  ) {
    if (
      !userNavigationPermissions.find(obj => 
        obj.navigationId === navigation.id && obj.permissionName.includes('delete')
      )
    ) {
      throw new ForbiddenException();
    }

    if (navigation.name === 'global') {
      throw new ForbiddenException('Global navigation cannot be deleted.');
    }
  }

  /**
   * Valid navigation business rules.
   * 
   * @param navigationDto The navigation to insert or update.
   * @param navigationId The navigation id (optional).
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