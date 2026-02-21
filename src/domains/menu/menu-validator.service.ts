import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Menu } from "./entities/menu.entity";
import { Repository } from "typeorm";
import { NavigationPermissions } from "src/core/models/navigation-permissions.interface";

@Injectable()
export class MenuValidatorService {

  constructor(
    @InjectRepository(Menu)
    private _menuRepository: Repository<Menu>
  ) { }

  /**
   * Valid permission to update style based on refId.
   * 
   * @param refId The refId (menu id or navigation id).
   * @param userNavigationPermissions The user navigation permissions.
   * @throws {ForbiddenException} If the user doesn't have edit permission on the navigation associated to the ref.
   * @description
   * Check if user has edit permission for given refId.
   * If not, it's possible refId is a menu and not a navigation so we fetch the menu from table by refId.
   * If there is no menu, refId is a navigation so we throw Forbidden error.
   * If there is a menu then we compare user navigation permissions with menu navigationId.
   */
  async validPermissionToUpdateStyle(
    refId: string,
    userNavigationPermissions: NavigationPermissions
  ) {
    if(
      !userNavigationPermissions.find(obj => obj.navigationId === refId)
        ?.permissionName.includes('edit')
    ) {
      const menu = await this._menuRepository.findOneBy({ id: refId });
      if (!menu) {
        throw new ForbiddenException();
      }
      else if (
        !userNavigationPermissions.find(obj => obj.navigationId === menu.navigationId)
          ?.permissionName.includes('edit')
      ) {
        throw new ForbiddenException();
      }
    }
  }

  /**
   * Valid permission to create navigation bar.
   * 
   * @param navigationId The navigation id.
   * @param userNavigationPermissions The user navigation permissions.
   * @throws {ForbiddenException} If user doesn't have 'add' access on navigation.
   */
  validPermissionToCreateNavigationBar(
    navigationId: string,
    userNavigationPermissions: NavigationPermissions
  ) {
    if (
      !userNavigationPermissions.find(obj => obj.navigationId === navigationId)
        ?.permissionName.includes('add')
    ) {
      throw new ForbiddenException();
    }
  }

}
