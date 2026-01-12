import { Injectable } from '@nestjs/common';
import { CreateContainerStyleDto } from './dto/create-container-style.dto';
import { UpdateContainerStyleDto } from './dto/update-container-style.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ContainerStyle } from './entities/container-style.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ContainerStyleService {
  
  constructor(
    @InjectRepository(ContainerStyle)
    private _containerStyleRepository: Repository<ContainerStyle>
  ) {}

  async create(createContainerStyleDto: CreateContainerStyleDto) {
    return await this._containerStyleRepository.save(createContainerStyleDto);
  }

  findAll() {
    return `This action returns all containerStyle`;
  }

  findOne(id: number) {
    return `This action returns a #${id} containerStyle`;
  }

  update(id: number, updateContainerStyleDto: UpdateContainerStyleDto) {
    return `This action updates a #${id} containerStyle`;
  }

  remove(id: number) {
    return `This action removes a #${id} containerStyle`;
  }
}
