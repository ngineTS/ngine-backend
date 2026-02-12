import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateContainerLayoutDto } from './dto/update-container-layout.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ContainerLayout } from './entities/container-layout.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ContainerLayoutService {

  constructor(
    @InjectRepository(ContainerLayout)
    private _containerLayoutRepository: Repository<ContainerLayout>,
  ) { }

  /**
   * Update containerLayout.
   * 
   * @param id The containerLayout id.
   * @param updateContainerLayoutDto The containerLayout properties to update.
   */
  async update(
    id: string,
    updateContainerLayoutDto: UpdateContainerLayoutDto,
    userNavigationPermissionsArray: Array<{
      navigationId: string;
      permissionName: string;
      navigationTypeName: string;
    }>
  ) {
    await this.validPermission(id, userNavigationPermissionsArray);
    return this._containerLayoutRepository.update(id, updateContainerLayoutDto);
  }

  /**
   * Valid permission to edit container layout.
   * @param containerLayoutId The container layout id.
   * @param userNavigationPermissionsArray The user navigation permissions.
   */
  async validPermission(
    containerLayoutId: string,
    userNavigationPermissionsArray: Array<{
      navigationId: string;
      permissionName: string;
      navigationTypeName: string;
    }>
  ) {
    const containerLayout = await this._containerLayoutRepository.findOneBy({ id: containerLayoutId });

    if (!containerLayout) {
      throw new NotFoundException(`Container layout with id ${containerLayoutId} has not been found.`);
    }

    /* /!\ Here we are sure refId is a navigation id and not a menu id  because this API is used to resize navigation. */
    if(
      !userNavigationPermissionsArray.find(obj => obj.navigationId === containerLayout.refId)
        ?.permissionName.includes('edit')
    ) {
      throw new ForbiddenException();
    }
  }
  
}
