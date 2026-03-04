import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { ContainerLayout } from '../container-layout/entities/container-layout.entity';
import { ContainerStyle } from '../container-style/entities/container-style.entity';
import { TypographyStyle } from '../typography-style/entities/typography-style.entity';
import { Navigation } from '../navigation/entities/navigation.entity';
import { NavigationType } from '../navigation-type/entities/navigation-type.entity';
import { omitObjectProperty } from 'src/core/utils/omit-object-property.util';
import { MenuValidatorService } from './menu-validator.service';

@Injectable()
export class MenuService {

  constructor(
    @InjectRepository(Menu)
    private _menuRepository: Repository<Menu>,
    @InjectRepository(ContainerLayout)
    private _containerLayoutRepository: Repository<ContainerLayout>,
    @InjectRepository(ContainerStyle)
    private _containerStyleRepository: Repository<ContainerStyle>,
    @InjectRepository(TypographyStyle)
    private _typographyStyleRepository: Repository<TypographyStyle>,
    @InjectRepository(Navigation)
    private _navigationRepository: Repository<Navigation>,
    @InjectRepository(NavigationType)
    private _navigationTypeRepository: Repository<NavigationType>,
  ) {}


  /**
   * Create menu for given navigation id.
   * 
   * @param navigationId The navigation id we want to associate a menu to.
   * @returns The created menu.
   */
  async createMenu(navigationId: string): Promise<Menu> {
    return await this._menuRepository.save({ navigationId: navigationId });
  }

  /**
   * Create navigation bar for given navigation id and add first redirect-button to it.
   * 
   * @param navigationId The navigationId to attach the menu to.
   * @param userId The user who creates this navigation bar.
   * @throws {ForbiddenException} If user doesn't have add permission on navigation.
   * @description
   * 1. Create navigation bar for given navigation with same style as navigation.
   * 2. Create first navigation inside navigation bar with same style as navigation.
   */
  async createNavigationBar(navigationId: string, userId: string) {
    /* 1. */
    const menuSaved = await this._menuRepository.save({ navigationId: navigationId });
    await this.inheritParentStyle(menuSaved.id, navigationId);

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
    await this.inheritParentStyle(firstAutoCreatedChildSaved.id, navigationId);
    
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
   * @param refId The object reference id.
   * @param updateMenuDto The style properties.
   * @returns The properties affected number.
   * @description
   * 1. If containerLayout property then update containerLayout entity.
   * 2. If containerStyle property then update containerStyle entity
   * 3. If typographyStyle property then update typographyStyle entity.
   */
  async updateStyleProperties(refId: string, updateMenuDto: UpdateMenuDto) {
    const affectedRelations: { [prop: string]: number | undefined } = {
      affectedContainerLayout: 0,
      affectedContainerStyle: 0,
      affectedTypographyStyle: 0
    }

    /* 1. */
    if (updateMenuDto['containerLayout']) {
      const updateContainerLayoutResponse = await this._containerLayoutRepository.update(
        { refId: refId }, 
        updateMenuDto['containerLayout']
      );
      if (updateContainerLayoutResponse.affected === 0) {
        throw new NotFoundException('No container layout associated tho this menu id has been found.')
      }
      affectedRelations.affectedContainerLayout = updateContainerLayoutResponse.affected;
    }

    /* 2. */
    if (updateMenuDto['containerStyle']) {
      const updateContainerStyleResponse = await this._containerStyleRepository.update(
        { refId: refId }, 
        updateMenuDto['containerStyle']
      );
      if (updateContainerStyleResponse.affected === 0) {
        throw new NotFoundException('No container style associated tho this menu id has been found.')
      }
      affectedRelations.affectedContainerStyle = updateContainerStyleResponse.affected;
    }

    /* 3. */
    if (updateMenuDto['typographyStyle']) {
      const updateTypographyStyleResponse = await this._typographyStyleRepository.update(
        { refId: refId }, 
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

  /**
   * Copy object style.
   * 
   * @param refId The ref we want to paste the style to.
   * @param parentRefId The ref we want to inherit the style from.
   * @throws {NotFoundException} if not style found for given parentRefId.
   */
  async inheritParentStyle(refId: string, parentRefId: string) {
    /* Get parent containerLayout. */
    let parentContainerLayout = await this._containerLayoutRepository.findOne({
      where: { refId: parentRefId }
    });
    if (!parentContainerLayout) {
      throw new NotFoundException(`No container layout found with refId ${parentRefId}`);
    }

    /* Get parent containerStyle. */
    let parentContainerStyle = await this._containerStyleRepository.findOne({
      where: { refId: parentRefId }
    });
    if (!parentContainerStyle) {
      throw new NotFoundException(`No container style found with refId ${parentRefId}`);
    }
    
    /* Get parent typographyStyle. */
    let parentTypographyStyle = await this._typographyStyleRepository.findOne({
      where: { refId: parentRefId }
    });
    if (!parentTypographyStyle) {
      throw new NotFoundException(`No typography style found with refId ${parentRefId}`);
    }

    /* Change refId and save containerLayout. */
    const containerLayoutPayload = omitObjectProperty(parentContainerLayout, 'id');
    containerLayoutPayload.xPos = 0;
    containerLayoutPayload.yPos = 0;
    containerLayoutPayload.refId = refId;
    await this._containerLayoutRepository.save(containerLayoutPayload);

    /* Change refId and save containerStyle. */
    const containerStylePayload = omitObjectProperty(parentContainerStyle, 'id');
    containerStylePayload.refId = refId;
    await this._containerStyleRepository.save(containerStylePayload);

    /* Change refId and save typographyStyle. */
    const typographyStylePayload = omitObjectProperty(parentTypographyStyle, 'id');
    typographyStylePayload.refId = refId;
    await this._typographyStyleRepository.save(typographyStylePayload);
  }

  /**
   * Create default container layout for given refId.
   * 
   * @param refId the object reference id.
   * @returns The container layout object saved.
   */
  async createDefaultContainerLayout(refId: string): Promise<ContainerLayout> {
    const containerLayoutPayload = {
      refId: refId,
      width: 50,
      height: 50,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      gap: 10
    }

    return await this._containerLayoutRepository.save(containerLayoutPayload);
  }

  /**
   * Create default container style for given refId.
   * 
   * @param refId the object reference id.
   * @returns The container style object saved.
   */
  async createDefaultContainerStyle(refId: string): Promise<ContainerStyle> {
    const containerStylePayload = {
      refId: refId,
      backgroundColor: '#636363',
      borderColor: '#1E90FF',
      borderStyle: 'solid',
      borderWidth: 4,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      isBorderTopHidden: false,
      isBorderRightHidden: false,
      isBorderBottomHidden: false,
      isBorderLeftHidden: false
    }
    
    return await this._containerStyleRepository.save(containerStylePayload);
  }

  /**
   * Create default typography style for given refId.
   * 
   * @param refId the object reference id.
   * @returns The typography style object saved.
   */
  async createDefaultTypographyStyle(refId: string): Promise<TypographyStyle> {
    const typographyStylePayload = {
      refId: refId,
      fontFamily: 'Roboto',
      fontSize: 16,
      fontWeight: 400,
      color: '#D3D3D3',
      activeColor: '#1E90FF'
    }

    return await this._typographyStyleRepository.save(typographyStylePayload);
  }

}
