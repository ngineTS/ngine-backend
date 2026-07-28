import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { Navigation } from '../navigation/entities/navigation.entity';
import { NavigationType } from '../navigation-type/entities/navigation-type.entity';
import { ContainerStyleService } from '../container-style/container-style.service';
import { ContainerLayoutService } from '../container-layout/container-layout.service';
import { TypographyStyleService } from '../typography-style/typography-style.service';

@Injectable()
export class MenuService {

  constructor(
    @InjectRepository(Menu)
    private _menuRepository: Repository<Menu>,
    @InjectRepository(Navigation)
    private _navigationRepository: Repository<Navigation>,
    @InjectRepository(NavigationType)
    private _navigationTypeRepository: Repository<NavigationType>,
    private _containerLayoutService: ContainerLayoutService,
    private _containerStyleService: ContainerStyleService,
    private _typographyStyleService: TypographyStyleService,
  ) {}


  /**
   * Create menu for given navigation id.
   * 
   * @param navigationId The navigation id we want to associate a menu to.
   * @param isVertical The menu orientation.
   * @returns The created menu.
   */
  createMenu(navigationId: string, isVertical = false): Promise<Menu> {
    return this._menuRepository.save({ navigationId: navigationId, isVertical: isVertical });
  }

  /**
   * Update menu orientation.
   *
   * @param id The menu id.
   * @param isVertical The wished orientation.
   * @returns The UpdateResult response.
   */
  updateMenu(id: string, isVertical: boolean) {
    return this._menuRepository.update(id, { isVertical: isVertical });
  }

  /**
   * Create navigation bar and add first redirect-button to it.
   * 
   * 1. Create navigation bar for given navigation id and assign style properties.
   * 2. Create first navigation inside navigation bar and assign style properties.
   * 
   * @param navigationId The navigationId to attach the menu to.
   * @param userId The user who creates this navigation bar.
   * @throws {ForbiddenException} If user doesn't have add permission on navigation.
   */
  async createNavigationBar(
    navigationId: string,
    userId: string,
    navigationBarType: 'vertical' | 'horizontal' = 'horizontal') {
    /* 1. */
    const menuSaved = await this._menuRepository.save({
      navigationId: navigationId,
      isVertical: navigationBarType === 'vertical'
    });
    await this._containerLayoutService.createObjectContainerLayout({ refId: menuSaved.id, width: 100, height: 75 });
    await this._containerStyleService.createObjectDefaultContainerStyle(menuSaved.id);

    /* 2. */
    const redirectButtonNavigationType = await this._navigationTypeRepository.findOne({
      where: { name: 'redirect-button' }
    });
    const firstAutoCreatedChild: any = {
      parentId: navigationId,
      name: 'sub-1',
      displayLabel: 'Sub 1',
      description: 'First navigation',
      isDisabled: false,
      order: 0,
      navigationTypeId: redirectButtonNavigationType!.id,
      createdDate: new Date(),
      createdBy: userId,
      updatedDate: new Date(),
      updatedBy: userId
    }
    const firstAutoCreatedChildSaved = await this._navigationRepository.save(firstAutoCreatedChild);
    await this._containerLayoutService.createObjectContainerLayout({ refId: firstAutoCreatedChildSaved.id });
    await this._containerStyleService.createObjectDefaultContainerStyle(firstAutoCreatedChildSaved.id);
    await this._typographyStyleService.createObjectDefaultTypographyStyle(firstAutoCreatedChildSaved.id);
    
    return JSON.stringify('Navigation bar successfully created.');
  }

  /**
   * Find menu by navigation id.
   * 
   * @param navigationId The navigationId that belongs to the menu.
   * @returns The menu or null if no menu found.
   */
  async findOneByNavigationId(navigationId: string) {
    return await this._menuRepository.findOne({
      where: { navigationId: navigationId }
    });
  }

  /**
   * Update the style properties of an object.
   * 
   * @description
   * 1. If containerLayout property then update containerLayout entity.
   * 2. If containerStyle property then update containerStyle entity
   * 3. If typographyStyle property then update typographyStyle entity.
   * 
   * @param refId The object reference id.
   * @param updateMenuDto The style properties.
   * @returns The properties affected number.
   */
  async updateStyleProperties(refId: string, updateMenuDto: UpdateMenuDto) {
    const affectedRelations: { [prop: string]: number | undefined } = {
      affectedContainerLayout: 0,
      affectedContainerStyle: 0,
      affectedTypographyStyle: 0
    }

    /* 1. */
    if (updateMenuDto['containerLayout']) {
      const updateContainerLayoutResponse = await this._containerLayoutService.updateByRefId(
        refId, 
        updateMenuDto['containerLayout']
      );

      if (updateContainerLayoutResponse.affected === 0) {
        throw new NotFoundException('No container layout associated tho this menu id has been found.')
      }

      affectedRelations.affectedContainerLayout = updateContainerLayoutResponse.affected;
    }

    /* 2. */
    if (updateMenuDto['containerStyle']) {
      const updateContainerStyleResponse = await this._containerStyleService.updateByRefId(
        refId, 
        updateMenuDto['containerStyle']
      );

      if (updateContainerStyleResponse.affected === 0) {
        throw new NotFoundException('No container style associated tho this menu id has been found.')
      }

      affectedRelations.affectedContainerStyle = updateContainerStyleResponse.affected;
    }

    /* 3. */
    if (updateMenuDto['typographyStyle']) {
      const updateTypographyStyleResponse = await this._typographyStyleService.updateByRefId(
        refId, 
        updateMenuDto['typographyStyle']
      );

      if (updateTypographyStyleResponse.affected === 0) {
        throw new NotFoundException('No typography style associated tho this menu id has been found.')
      }

      affectedRelations.affectedTypographyStyle = updateTypographyStyleResponse.affected;
    }

    return affectedRelations;
  }

  /**
   * Delete menu.
   * 
   * @param id The menu id.
   * @returns A delete response.
   */
  async remove(id: string) {
    const deleteResponse = await this._menuRepository.delete(id);
    if (deleteResponse.affected === 0) {
      throw new NotFoundException(`Menu ${id} not found.`);
    }

    return deleteResponse;
  }

}
