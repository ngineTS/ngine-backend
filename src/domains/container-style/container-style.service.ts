import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContainerStyle } from './entities/container-style.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ContainerStyleService {
  
  constructor(
    @InjectRepository(ContainerStyle)
    private _containerStyleRepository: Repository<ContainerStyle>
  ) { }

  
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

}
