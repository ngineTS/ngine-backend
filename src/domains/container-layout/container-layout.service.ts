import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContainerLayoutDto } from './dto/create-container-layout.dto';
import { UpdateContainerLayoutDto } from './dto/update-container-layout.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ContainerLayout } from './entities/container-layout.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ContainerLayoutService {

  constructor(
    @InjectRepository(ContainerLayout)
    private _containerLayoutRepository: Repository<ContainerLayout>
  ) {}

  async create(createContainerLayoutDto: CreateContainerLayoutDto) {
    return await this._containerLayoutRepository.save(createContainerLayoutDto);
  }

  findAll() {
    return `This action returns all containerLayout`;
  }

  findOne(id: number) {
    return `This action returns a #${id} containerLayout`;
  }

  async update(id: string, updateContainerLayoutDto: UpdateContainerLayoutDto) {
    const updateResponse = await this._containerLayoutRepository.update(id, updateContainerLayoutDto);

    if(updateResponse.affected === 0) {
      throw new NotFoundException(`Container layout with id: ${id} has not been found.`);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} containerLayout`;
  }
}
