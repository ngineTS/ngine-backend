import { Injectable } from '@nestjs/common';
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

  update(id: number, updateContainerLayoutDto: UpdateContainerLayoutDto) {
    return `This action updates a #${id} containerLayout`;
  }

  remove(id: number) {
    return `This action removes a #${id} containerLayout`;
  }
}
