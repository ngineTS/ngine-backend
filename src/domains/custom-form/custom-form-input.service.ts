import { Injectable } from '@nestjs/common';
import { CreateCustomFormDto } from './dto/create-custom-form-input.dto';
import { UpdateCustomFormDto } from './dto/update-custom-form-input.dto';

@Injectable()
export class CustomFormService {
  create(createCustomFormDto: CreateCustomFormDto) {
    return 'This action adds a new customForm';
  }

  findAll() {
    return `This action returns all customForm`;
  }

  findOne(id: number) {
    return `This action returns a #${id} customForm`;
  }

  update(id: number, updateCustomFormDto: UpdateCustomFormDto) {
    return `This action updates a #${id} customForm`;
  }

  remove(id: number) {
    return `This action removes a #${id} customForm`;
  }
}
