import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypographyStyle } from './entities/typography-style.entity';
import { Repository } from 'typeorm';

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

}
