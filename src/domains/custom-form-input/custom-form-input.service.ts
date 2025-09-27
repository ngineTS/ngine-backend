import { Injectable } from '@nestjs/common';
import { CreateCustomFormInputDto } from './dto/create-custom-form-input.dto';
import { UpdateCustomFormInputDto } from './dto/update-custom-form-input.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomFormInput } from './entities/custom-form-input.entity';
import { ColumnType, Repository } from 'typeorm';
import { stringToLowerCaseWithUnderscore } from 'src/core/utils/string-transfo-util';
import { SimpleColumnType, SpatialColumnType, WithLengthColumnType, WithPrecisionColumnType, WithWidthColumnType } from 'typeorm/driver/types/ColumnTypes';
import { CustomTableService } from '../custom-table/custom-table.service';

@Injectable()
export class CustomFormInputService {

  inputTypeDatabaseTypeMap = new Map<string, WithPrecisionColumnType | WithLengthColumnType | WithWidthColumnType | SpatialColumnType | SimpleColumnType>([
    ["email", "varchar"],
    ["url", "varchar"],
    ["text", "varchar"],
    ["password", "varchar"],
    ["textarea", "varchar"],
    ["number", "int"],
    ["date", "timestamp"],
    ["date-and-time", "timestamp"],
    ["file", "varchar"],
    ["checkbox", "boolean"]
  ]);

  constructor(@InjectRepository(CustomFormInput)
              private _customFormInputRepository: Repository<CustomFormInput>,
              private _customTableService: CustomTableService) {}

  async create(createCustomFormDto: CreateCustomFormInputDto[], tableName: string) {
    createCustomFormDto.forEach(column => {
      column.columnType = this.inputTypeDatabaseTypeMap.get(column.inputType)!;
      column.columnName = stringToLowerCaseWithUnderscore(column.inputLabel);
    });
    const result = await this._customTableService.createDatabaseTable(tableName, createCustomFormDto);
    return this._customFormInputRepository.save(createCustomFormDto);
  }

  update(id: string, updateCustomFormDto: UpdateCustomFormInputDto) {
    return this._customFormInputRepository.update(id, updateCustomFormDto);
  }

}
