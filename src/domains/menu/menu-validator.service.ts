import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Menu } from "./entities/menu.entity";
import { Repository } from "typeorm";
import { NavigationPermissions } from "src/core/models/navigation-permissions.interface";
import { Navigation } from "../navigation/entities/navigation.entity";

@Injectable()
export class MenuValidatorService {

  constructor(
    @InjectRepository(Menu)
    private _menuRepository: Repository<Menu>,
    @InjectRepository(Navigation)
    private _navigationRepository: Repository<Navigation>
  ) { }

  /**
   * Valid permission to update style.
   * 
   * Check if user has edit permission on given ref for below scenario:
   * - ref is a menu --> check against associated navigation
   * - ref is a navigation --> check against it
   * 
   * @param refId The ref id (menu id or navigation id).
   * @param userNavigationPermissions The user navigation permissions.
   * @returns The navigation associated to the ref id.
   * @throws {NotFoundException} If ref is not found.
   * @throws {ForbiddenException} If navigation associated to the ref is a 'publish' record.
   * @throws {ForbiddenException} If user doesn't have edit permission on the navigation associated to the ref.
   */
  async validPermissionToUpdateStyle(
    refId: string,
    userNavigationPermissions: NavigationPermissions
  ): Promise<Navigation> {
    const navigation = await this._navigationRepository.findOneBy({ id: refId });

    //if ref is a menu
    if (!navigation) {
      const menu = await this._menuRepository.findOneBy({ id: refId });
      const navigationAssociatedToMenu = await this._navigationRepository.findOneBy({ id: menu?.navigationId });

      if (!navigationAssociatedToMenu) {
        throw new NotFoundException(`Navigation associated to menu with id ${refId} has not been found.`);
      }

      if (!navigationAssociatedToMenu?.isDraft) {
        throw new ForbiddenException(`'Publish' record cannot be edited.`);
      }

      if (
        !userNavigationPermissions.find(obj => obj.navigationGroupId === navigationAssociatedToMenu?.groupId)
          ?.permissionName.includes('edit')
      ) {
        throw new ForbiddenException();
      }

      return navigationAssociatedToMenu;
    }
    //if ref is a navigation
    else {
      if (!navigation.isDraft) {
        throw new ForbiddenException(`'Publish' record cannot be edited.`);
      }

      if (
        !userNavigationPermissions.find(obj => obj.navigationGroupId === navigation.groupId)
          ?.permissionName.includes('edit')
      ) { 
        throw new ForbiddenException();
      }

      return navigation;
    }
  }

  /**
   * Valid permission to create navigation bar.
   * 
   * @param navigationId The navigation id.
   * @param userNavigationPermissions The user navigation permissions.
   * @returns The navigation entity associated to the navigation id.
   * @throws {NotFoundException} If navigation is not found.
   * @throws {ForbiddenException} If user doesn't have 'add' access on navigation.
   * @this {ForbiddenException} If navigation is a 'publish' record.
   */
  async validPermissionToCreateNavigationBar(
    navigationId: string,
    userNavigationPermissions: NavigationPermissions
  ) {
    const navigation = await this._navigationRepository.findOneBy({ id: navigationId });
    if (!navigation) {
      throw new NotFoundException(`Navigation with id ${navigationId} not found.`);
    }

    if (!navigation.isDraft) {
      throw new ForbiddenException(`'Publish' record cannot be edited`);
    }

    if (
      !userNavigationPermissions.find(obj => obj.navigationGroupId === navigation.groupId)
        ?.permissionName.includes('add')
    ) {
      throw new ForbiddenException();
    }

    return navigation;
  }

}
