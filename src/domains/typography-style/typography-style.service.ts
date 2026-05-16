import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypographyStyle } from './entities/typography-style.entity';
import { Repository } from 'typeorm';
import { UpdateTypographyStyleDto } from './dto/update-typography-style.dto';

@Injectable()
export class TypographyStyleService {
  
  constructor(
    @InjectRepository(TypographyStyle)
    private _typographyStyleRepository: Repository<TypographyStyle>
  ) { }
  
  /**
   * Get default typography style.
   * 
   * @returns The default typography style.
   */
  geDefaultTypographyStyle() {
    return this._typographyStyleRepository.findOne({
      where: { refId: '00000000-0000-0000-0000-000000000000' }
    });
  }

  /**
   * Create object typography style based on default value.
   * 
   * @params The object id.
   * @returns The typography style saved.
   * @throws {NotFoundException} If default typography style not found.
   */
  async createObjectTypographyStyle(refId: string) {
    const defaultTypographyStyle = await this.geDefaultTypographyStyle();

    if (!defaultTypographyStyle) {
      throw new NotFoundException('Default container style not found.');
    }

    const { id, ...objectTypographyStyle } = defaultTypographyStyle;
    objectTypographyStyle.refId = refId;

    return this._typographyStyleRepository.save(objectTypographyStyle);
  }

  /**
   * Update typography style by ref id.
   * 
   * @param refId The ref id.
   * @param updateTypographyStyleDto The typography style properties.
   * @returns A promise of UpdateResponse object.
   */
  updateByRefId(refId: string, updateTypographyStyletDto: UpdateTypographyStyleDto) {
    return this._typographyStyleRepository.update(
      { refId: refId }, 
      updateTypographyStyletDto
    );
  }

  /**
   * Delete typography style by ref id.
   * 
   * @param refId The ref id.
   * @returns A promise of DeleteResponse object.
   */
  deleteByRefId(refId: string) {
    return this._typographyStyleRepository.delete({ refId: refId });
  }

}
