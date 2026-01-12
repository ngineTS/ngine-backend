import { Injectable } from '@nestjs/common';
import { CreateContainerStyleDto } from './dto/create-container-style.dto';
import { UpdateContainerStyleDto } from './dto/update-container-style.dto';

@Injectable()
export class ContainerStyleService {
  create(createContainerStyleDto: CreateContainerStyleDto) {
    return 'This action adds a new containerStyle';
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
