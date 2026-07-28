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
   * Create container layout.
   * 
   * @param createContainerLayoutDto The container layout properties.
   * @returns The container layout saved.
   */
  createObjectContainerLayout(createContainerLayoutDto: CreateContainerLayoutDto) {
    return this._containerLayoutRepository.save(createContainerLayoutDto);
  }

  /**
   * Update containerLayout.
   * 
   * @param id The containerLayout id.
   * @param updateContainerLayoutDto The containerLayout properties.
   */
  update(id: string, updateContainerLayoutDto: UpdateContainerLayoutDto) {
    return this._containerLayoutRepository.update(id, updateContainerLayoutDto);
  }

  /**
   * Update container layout by ref id.
   * 
   * @param refId The ref id.
   * @param updateContainerLayoutDto The container layout properties
   * @returns A promise of UpdateResponse object.
   */
  updateByRefId(refId: string, updateContainerLayoutDto: UpdateContainerLayoutDto) {
    return this._containerLayoutRepository.update(
      { refId: refId }, 
      updateContainerLayoutDto
    );
  }

  /**
   * Delete container layout by ref id.
   * 
   * @param refId The ref id.
   * @returns A promise of DeleteResponse object.
   */
  deleteByRefId(refId: string) {
    return this._containerLayoutRepository.delete({ refId: refId });
  }
  
}
