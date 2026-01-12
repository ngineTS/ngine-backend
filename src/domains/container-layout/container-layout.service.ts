import { Injectable } from '@nestjs/common';
import { CreateContainerLayoutDto } from './dto/create-container-layout.dto';
import { UpdateContainerLayoutDto } from './dto/update-container-layout.dto';

@Injectable()
export class ContainerLayoutService {
  create(createContainerLayoutDto: CreateContainerLayoutDto) {
    return 'This action adds a new containerLayout';
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
