import { Injectable } from '@nestjs/common';
import { CreateCustomFormInputDto } from './dto/create-custom-form-input.dto';
import { UpdateCustomFormInputDto } from './dto/update-custom-form-input.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomFormInput } from './entities/custom-form-input.entity';
import { ColumnType, Repository } from 'typeorm';
import { stringToLowerCaseWithUnderscore } from 'src/core/utils/string-transfo-util';
import { SimpleColumnType, SpatialColumnType, WithLengthColumnType, WithPrecisionColumnType, WithWidthColumnType } from 'typeorm/driver/types/ColumnTypes';

@Injectable()
export class CustomFormInputService {

  inputTypeDatabaseTypeMap = new Map<string, WithPrecisionColumnType | WithLengthColumnType | WithWidthColumnType | SpatialColumnType | SimpleColumnType>([
    ["email", "varchar"],
    ["url", "varchar"],
    ["text", "varchar"],
    ["password", "varchar"],
    ["number", "varchar"],
    ["date", "timestamp"],
    ["date-and-time", "timestamp"],
    ["file", "varchar"],
    ["textarea", "varchar"],
    ["checkbox", "boolean"]
  ]);

  constructor(@InjectRepository(CustomFormInput)
              private customFormInputRepository: Repository<CustomFormInput>) {}

  async create(createCustomFormDto: CreateCustomFormInputDto[]) {
    createCustomFormDto.forEach(column => {
      column.columnType = this.inputTypeDatabaseTypeMap.get(column.inputType)!;
      column.columnName = stringToLowerCaseWithUnderscore(column.inputLabel);
    })
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
