import { Injectable } from '@nestjs/common';
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
  async update(id: string, updateContainerLayoutDto: UpdateContainerLayoutDto) {
    return this._containerLayoutRepository.update(id, updateContainerLayoutDto);
  }
  
}
