import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContainerStyle } from './entities/container-style.entity';
import { Repository } from 'typeorm';
import { UpdateContainerStyleDto } from './dto/update-container-style.dto';
import { CreateContainerStyleDto } from './dto/create-container-style.dto';

@Injectable()
export class ContainerStyleService {
  
  constructor(
    @InjectRepository(ContainerStyle)
    private _containerStyleRepository: Repository<ContainerStyle>
  ) { }

  /**
   * Create container style.
   * 
   * @param createContainerStyleDto The container style properties.
   * @returns The container style saved.
   */
  createObjectContainerStyle(createContainerStyleDto: CreateContainerStyleDto) {
    return this._containerStyleRepository.save(createContainerStyleDto);
  }

  /**
   * Get default container style.
   * 
   * @returns The default container style.
   */
  geDefaultContainerStyle() {
    return this._containerStyleRepository.findOne({
      where: { refId: '00000000-0000-0000-0000-000000000000' }
    });
  }

  /**
   * Create object container style based on default value.
   * 
   * If object belongs to a menu then hide border and background color.
   * 
   * @param refId The object id.
   * @param isInsideMenu Boolean to identify is object belong to a menu (ex: navigation inside navigation bar)
   * @returns The container style saved.
   * @throws {NotFoundException} If default container style not found.
   */
  async createObjectDefaultContainerStyle(refId: string, isInsideMenu = false) {
    const defaultContainerStyle = await this.geDefaultContainerStyle();

    if (!defaultContainerStyle) {
      throw new NotFoundException('Default container style not found.');
    }

    const { id, ...objectContainerStyle } = defaultContainerStyle;
    objectContainerStyle.refId = refId;

    if (isInsideMenu) {
      objectContainerStyle.isBackgroundTransparent = true;
      objectContainerStyle.isBorderBottomHidden = true;
      objectContainerStyle.isBorderLeftHidden = true;
      objectContainerStyle.isBorderRightHidden = true;
      objectContainerStyle.isBorderTopHidden = true;
    }

    return this._containerStyleRepository.save(objectContainerStyle);
  }

  /**
   * Update container style by ref id.
   * 
   * @param refId The ref id.
   * @param updateContainerStyleDto The container style properties.
   * @returns A promise of UpdateResponse object.
   */
  updateByRefId(refId: string, updateContainerStyletDto: UpdateContainerStyleDto) {
    return this._containerStyleRepository.update(
      { refId: refId }, 
      updateContainerStyletDto
    );
  }

  /**
   * Delete container style by ref id.
   * 
   * @param refId The ref id.
   * @returns A promise of DeleteResponse object.
   */
  deleteByRefId(refId: string) {
    return this._containerStyleRepository.delete({ refId: refId });
  }

}
