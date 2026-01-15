import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
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
    private _navigationTypeRepository: Repository<NavigationType>
  ) {}

  /**
   * Create navigation bar for given navigation Id and add first redirect-button to it.
   * @param navigationId The navigationId to attach the menu to.
   * @param userId The user who creates this navigation bar.
   */
  async createNavigationBar(navigationId: string, userId: string) {
    /* Create first redirect-button of navigation bar with default style. */
    const redirectButtonNavigationType = await this._navigationTypeRepository.findOne({
      where: { name: 'redirect-button' }
    });
    const navigation: any = {
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
    await this._navigationRepository.save(navigation);
    await this.createDefaultContainerLayout(navigation.id);
    await this.createDefaultContainerStyle(navigation.id);
    await this.createDefaultTypographyStyle(navigation.id);

    /* Inherit menu style from parent menu and create navigation bar. */
    this.inheritParentMenuConfig(navigationId);
    
    /* Return success message. */
    return JSON.stringify('Navigation bar successfully created.');
  }

  async findOneByNavigationId(navigationId: string) {
    return await this._menuRepository.findOne({
      where: { navigationId: navigationId }
    });
  }

  /**
   * Update the style properties of an object.
   * @param refId The object reference id to update.
   * @param updateMenuDto The style properties.
   * @returns The properties affected number.
   */
  async update(refId: string, updateMenuDto: UpdateMenuDto) {
    const affectedRelations: { [prop: string]: number | undefined } = {
      affectedContainerLayout: 0,
      affectedContainerStyle: 0,
      affectedTypographyStyle: 0
    }

    /* Container layout */
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

    /* Container style */
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

    /* Typography style */
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

  async remove(id: string) {
    return await this._menuRepository.delete(id);
  }

  /**
   * Retrieve parent menu configuration and copy it to given navigation.
   * @param navigationId The navigationId which we want to create a menu to.
   */
  async inheritParentMenuConfig(navigationId: string) {
    /* Get navigation from navigationId and throw error if not found. */
    const navigation = await this._navigationRepository.findOne({
      where: { id: navigationId }
    });
    if (!navigation) {
      throw new NotFoundException(`No navigation found with id ${navigationId}`)
    };

    /* Get menu of parent navigation and throw error if not found. */
    const parentMenu = await this._menuRepository.findOne({
      where: { navigationId: navigation.parentId },
      relations: [
        'containerLayout',
        'containerStyle',
        'typographyStyle'
      ]
    });
    if (!parentMenu) {
      throw new NotFoundException(`No menu associated to navigation ${navigation.parentId} has been found.`);
    }

    /* Save menu. */
    const menuSaved = await this._menuRepository.save({ navigationId: navigationId });

    /* Change refId and save containerLayout. */
    const containerLayoutPayload = omitObjectProperty(parentMenu.containerLayout, 'id');
    containerLayoutPayload.refId = menuSaved.id;
    await this._containerLayoutRepository.save(containerLayoutPayload);

    /* Change refId and save containerStyle. */
    const containerStylePayload = omitObjectProperty(parentMenu.containerStyle, 'id');
    containerStylePayload.refId = menuSaved.id;
    await this._containerStyleRepository.save(containerStylePayload);

    /* Change refId and save typographyStyle. */
    const typographyStylePayload = omitObjectProperty(parentMenu.typographyStyle, 'id');
    typographyStylePayload.refId = menuSaved.id;
    await this._typographyStyleRepository.save(typographyStylePayload);
  }

  /**
   * Create default container layout for given refId
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
   * Create default container style for given refId
   * @param refId the object reference id.
   * @returns The container style object saved.
   */
  async createDefaultContainerStyle(refId: string): Promise<ContainerStyle> {
    const containerStylePayload = {
      refId: refId,
      backGroundcolor: '#636363',
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
   * Create default typography style for given refId
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
