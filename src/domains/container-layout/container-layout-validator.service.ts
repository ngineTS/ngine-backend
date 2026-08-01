import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { NavigationPermissions } from "src/core/models/navigation-permissions.interface";
import { ContainerLayout } from "./entities/container-layout.entity";
import { Repository } from "typeorm";
import { Navigation } from "../navigation/entities/navigation.entity";

@Injectable()
export class containerLayoutValidatorService {

  constructor(
    @InjectRepository(ContainerLayout)
    private _containerLayoutRepository: Repository<ContainerLayout>,
    @InjectRepository(Navigation)
    private _navigationRepository: Repository<Navigation>
  ) { }

  /**
   * Valid permission to edit container layout.
   * 
   * @param containerLayoutId The container layout id.
   * @param userNavigationPermissionsArray The user navigation permissions.
   * @returns The navigation id associated to the container layout.
   * @throws {NotFoundException} If container layout or navigation associated to the container layout is not found.
   * @throws {ForbiddenException} If navigation associated to the container layout is a 'publish' record.
   * @throws {ForbiddenException} If user doesn't have edit permission on the navigation associated to the container layout.
   */
  async validPermission(
    containerLayoutId: string,
    userNavigationPermissions: NavigationPermissions
  ): Promise<Navigation> {
    const containerLayout = await this._containerLayoutRepository.findOneBy({ id: containerLayoutId });

    if (!containerLayout) {
      throw new NotFoundException(`Container layout with id ${containerLayoutId} has not been found.`);
    }

    /* /!\ Here we are sure refId is a navigation id and not a menu id because this API is used to resize navigation. */
    const navigation = await this._navigationRepository.findOneBy({ id: containerLayout.refId });
    if (!navigation) {
      throw new NotFoundException(`Navigation with id ${containerLayout.refId} has not been found.`);
    }

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