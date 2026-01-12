import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { ContainerLayout } from '../container-layout/entities/container-layout.entity';
import { ContainerStyle } from '../container-style/entities/container-style.entity';
import { TypographyStyle } from '../typography-style/entities/typography-style.entity';

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
    private _typographyStyleRepository: Repository<TypographyStyle>
  ) {}

  async create(createMenuDto: CreateMenuDto) {
    return await this._menuRepository.save(createMenuDto);
  }

  findOne(id: number) {
    return `This action returns a #${id} menu`;
  }

  /**
   * Update the style properties of the menu.
   * @param menuId The menu id to update.
   * @param updateMenuDto The style properties.
   * @returns The properties affected number.
   */
  async update(menuId: string, updateMenuDto: UpdateMenuDto) {
    const affectedRelations: { [prop: string]: number | undefined } = {
      affectedContainerLayout: 0,
      affectedContainerStyle: 0,
      affectedTypographyStyle: 0
    }

    if (updateMenuDto['containerLayout']) {
      const updateContainerLayoutResponse = await this._containerLayoutRepository.update(
        { refId: menuId }, 
        updateMenuDto['containerLayout']
      );
      if (updateContainerLayoutResponse.affected === 0) {
        throw new NotFoundException('No container layout associated tho this menu id has been found.')
      }
      affectedRelations.affectedContainerLayout = updateContainerLayoutResponse.affected;
    }

    if (updateMenuDto['containerStyle']) {
      const updateContainerStyleResponse = await this._containerStyleRepository.update(
        { refId: menuId }, 
        updateMenuDto['containerStyle']
      );
      if (updateContainerStyleResponse.affected === 0) {
        throw new NotFoundException('No container style associated tho this menu id has been found.')
      }
      affectedRelations.affectedContainerStyle = updateContainerStyleResponse.affected;
    }

    if (updateMenuDto['typographyStyle']) {
      const updateTypographyStyleResponse = await this._typographyStyleRepository.update(
        { refId: menuId }, 
        updateMenuDto['typographyStyle']
      );
      if (updateTypographyStyleResponse.affected === 0) {
        throw new NotFoundException('No typography style associated tho this menu id has been found.')
      }
      affectedRelations.affectedTypographyStyle = updateTypographyStyleResponse.affected;
    }

    return affectedRelations;
  }

  remove(id: number) {
    return `This action removes a #${id} menu`;
  }
}
