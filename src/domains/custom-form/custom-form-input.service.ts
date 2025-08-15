import { Injectable } from '@nestjs/common';
import { CreateCustomFormInputDto } from './dto/create-custom-form-input.dto';
import { UpdateCustomFormInputDto } from './dto/update-custom-form-input.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomFormInput } from './entities/custom-form-input.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CustomFormInputService {

  constructor(@InjectRepository(CustomFormInput)
              private customFormInputRepository: Repository<CustomFormInput>) {}

  create(createCustomFormDto: CreateCustomFormInputDto) {
    return this.customFormInputRepository.save(createCustomFormDto);
  }

  findAll() {
    return `This action returns all customForm`;
  }

  findOne(id: number) {
    return `This action returns a #${id} customForm`;
  }

  update(id: string, updateCustomFormDto: UpdateCustomFormInputDto) {
    return this.customFormInputRepository.update(id, updateCustomFormDto);
  }

  remove(id: number) {
    return `This action removes a #${id} customForm`;
  }
}
