import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateContainerLayoutDto } from './dto/update-container-layout.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ContainerLayout } from './entities/container-layout.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ContainerLayoutService {

  constructor(
    @InjectRepository(ContainerLayout)
    private _containerLayoutRepository: Repository<ContainerLayout>
  ) { }

  async update(id: string, updateContainerLayoutDto: UpdateContainerLayoutDto) {
    const updateResponse = await this._containerLayoutRepository.update(id, updateContainerLayoutDto);

    if(updateResponse.affected === 0) {
      throw new NotFoundException(`Container layout with id: ${id} has not been found.`);
    }
  }

}
