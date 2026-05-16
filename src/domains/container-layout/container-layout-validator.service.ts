import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { NavigationPermissions } from "src/core/models/navigation-permissions.interface";
import { ContainerLayout } from "./entities/container-layout.entity";
import { Repository } from "typeorm";

@Injectable()
export class containerLayoutValidatorService {

  constructor(
    @InjectRepository(ContainerLayout)
    private _containerLayoutRepository: Repository<ContainerLayout>
  ) { }

  /**
   * Valid permission to edit container layout.
   * 
   * @param containerLayoutId The container layout id.
   * @param userNavigationPermissionsArray The user navigation permissions.
   */
  async validPermission(
    containerLayoutId: string,
    userNavigationPermissions: NavigationPermissions
  ) {
    const containerLayout = await this._containerLayoutRepository.findOneBy({ id: containerLayoutId });

    if (!containerLayout) {
      throw new NotFoundException(`Container layout with id ${containerLayoutId} has not been found.`);
    }

    /* /!\ Here we are sure refId is a navigation id and not a menu id  because this API is used to resize navigation. */
    if(
      !userNavigationPermissions.find(obj => obj.navigationId === containerLayout.refId)
        ?.permissionName.includes('edit')
    ) {
      throw new ForbiddenException();
    }
  }
}