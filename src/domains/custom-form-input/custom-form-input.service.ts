import { Injectable, NotFoundException } from '@nestjs/common';
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

  constructor(
    @InjectRepository(CustomFormInput)
    private _customFormInputRepository: Repository<CustomFormInput>,
    private _customTableService: CustomTableService
  ) { }

  /**
   * The input type mapping object.
   * Map frontend form input type to postgres column type.
   */
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

  /**
   * Create a new table based on inputs configuration and save inputs metadata.
   * 
   * @param createCustomFormDto The inputs configuration.
   * @param tableName The table name.
   * @returns The inputs metadata saved.
   * @description
   * 1. Map input type to postgres column type and define column name.
   * 2. Create table from table name and column configuration.
   * 3. Save inputs metadata.
   */
  async create(
    createCustomFormDto: Array<CreateCustomFormInputDto>,
    tableName: string
  ) {
    /* 1. */
    createCustomFormDto.forEach(column => {
      if (column.inputType === 'dropdown' && column.columnType) {
        column.columnType = this.inputTypeDatabaseTypeMap.get(column.columnType);
      } else {
        column.columnType = this.inputTypeDatabaseTypeMap.get(column.inputType);
      }
    
      column.columnName = stringToLowerCaseWithUnderscore(column.inputLabel);
    });

    /* 2. */
    await this._customTableService.createDatabaseTable(tableName, createCustomFormDto);

    /* 3. */
    return this._customFormInputRepository.save(createCustomFormDto);
  }

  
  /**
   * Update inputs configuration.
   * 
   * @param id The customFormInput id.
   * @param updateCustomFormDto The customFormInputs properties to update.
   * @returns Update response type.
   * @throws {NotFoundException} If no row affected.
   */
  async update(
    id: string,
    updateCustomFormDto: UpdateCustomFormInputDto
  ) {
    const updateResponse = await this._customFormInputRepository.update(id, updateCustomFormDto);

    if (updateResponse.affected === 0) {
      throw new NotFoundException(`Custom form input ${id} not found.`)
    }

    return updateResponse;
  }

}
