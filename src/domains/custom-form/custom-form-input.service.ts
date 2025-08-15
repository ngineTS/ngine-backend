import { Injectable } from '@nestjs/common';
import { CreateCustomFormInputDto } from './dto/create-custom-form-input.dto';
import { UpdateCustomFormInputDto } from './dto/update-custom-form-input.dto';

@Injectable()
export class CustomFormInputService {
  create(createCustomFormDto: CreateCustomFormInputDto) {
    return 'This action adds a new customForm';
  }

  findAll() {
    return `This action returns all customForm`;
  }

  findOne(id: number) {
    return `This action returns a #${id} customForm`;
  }

  update(id: number, updateCustomFormDto: UpdateCustomFormInputDto) {
    return `This action updates a #${id} customForm`;
  }

  remove(id: number) {
    return `This action removes a #${id} customForm`;
  }
}
