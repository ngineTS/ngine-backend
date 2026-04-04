import { Injectable } from '@nestjs/common';
import { UpdateContainerLayoutDto } from './dto/update-container-layout.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ContainerLayout } from './entities/container-layout.entity';
import { Repository } from 'typeorm';
import { CreateContainerLayoutDto } from './dto/create-container-layout.dto';

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
   * @param updateContainerLayoutDto The containerLayout properties.
   */
  async update(id: string, updateContainerLayoutDto: UpdateContainerLayoutDto) {
    return this._containerLayoutRepository.update(id, updateContainerLayoutDto);
  }

  /**
   * Create container layout.
   * 
   * @param createContainerLayoutDto The container layout properties.
   * @returns The containe rlayout saved.
   */
  createObjectContainerLayout(createContainerLayoutDto: CreateContainerLayoutDto) {
    return this._containerLayoutRepository.save(createContainerLayoutDto);
  }
  
}
