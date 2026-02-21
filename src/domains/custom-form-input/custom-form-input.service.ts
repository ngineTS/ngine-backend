import { Injectable } from '@nestjs/common';
import { CreateCustomFormInputDto } from './dto/create-custom-form-input.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomFormInput } from './entities/custom-form-input.entity';
import { Repository } from 'typeorm';
import { stringToLowerCaseWithUnderscore } from 'src/core/utils/string-transfo-util';
import { SimpleColumnType, SpatialColumnType, WithLengthColumnType, WithPrecisionColumnType, WithWidthColumnType } from 'typeorm/driver/types/ColumnTypes';
import { CustomTableService } from '../custom-table/custom-table.service';
import { CustomTableValidatorService } from '../custom-table/custom-table-validator.service';

@Injectable()
export class CustomFormInputService {

  constructor(
    @InjectRepository(CustomFormInput)
    private _customFormInputRepository: Repository<CustomFormInput>,
    private _customTableService: CustomTableService,
    private _customTableValidatorService: CustomTableValidatorService
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
    ["number", "float4"],
    ["date", "timestamp"],
    ["date-and-time", "timestamp"],
    ["file", "varchar"],
    ["checkbox", "boolean"],
    ["varchar", "varchar"],
    ["boolean", "boolean"],
    ["float4", "float4"],
    ["timestamp", "timestamp"]
  ]);

  /**
   * Create a new table based on inputs configuration and save inputs metadata.
   * 
   * @param createCustomInputsFormDto The inputs configuration.
   * @param tableName The table name.
   * @param userNavigationPermissions The user navigation permissions.
   * @returns The inputs metadata saved.
   * @description
   * 1. Map input type to postgres column type and define column name.
   * 2. Create database custom table based on table name and column configuration.
   * 3. Save inputs metadata.
   */
  async create(
    createCustomInputsFormDto: Array<CreateCustomFormInputDto>,
    tableName: string
  ) {
    /* 1. */
    this.setUpColumnNameAndType(createCustomInputsFormDto);
    /* 2. */
    await this._customTableService.createDatabaseTable(tableName, createCustomInputsFormDto);
    /* 3. */
    return this._customFormInputRepository.save(createCustomInputsFormDto);
  }

  
  /**
   * Update inputs configuration.
   * 
   * @param tableName The table name.
   * @param createCustomInputsFormDto The inputs configuration.
   * @returns Update response type.
   * @throws {NotFoundException} If no row affected.
   * @description
   * 1. Map input type to postgres column type and define column name.
   * 2. Identify new inputs to add.
   * 3. Identify inputs to delete.
   * 4. Identify inputs to update.
   * 5. Update database custom table.
   * 6. Update inputs metadata.
   */
  async update(
    tableName: string,
    createCustomInputsFormDto: Array<CreateCustomFormInputDto>
  ) {
    /* 1. */
    this.setUpColumnNameAndType(createCustomInputsFormDto); 

    /* 2. */
    const inputsToAdd = createCustomInputsFormDto.filter(payloadInput => !payloadInput.id);

    /* 3. */
    const dbInputs = await this._customFormInputRepository.find({
      where: { tableId: createCustomInputsFormDto[0].tableId }
    });
    const inputsToDelete = dbInputs.filter(dbInput => 
      !createCustomInputsFormDto.find(payloadInput => payloadInput.id === dbInput.id)
    );

    /* 4. */
    const inputsToUpdate = createCustomInputsFormDto.filter(payloadInput => 
      dbInputs.find(dbInput => 
        dbInput.id === payloadInput.id && (
          dbInput.columnName !== payloadInput.columnName ||
          dbInput.columnType !== payloadInput.columnType 
        )
      )
    )
    inputsToUpdate.forEach(input => 
      input['oldColumnName'] = dbInputs.find(obj => obj.id === input.id)?.columnName
    );

    /* 5 */
    await this._customTableService.updateDatabaseTable(
      tableName,
      inputsToAdd,
      inputsToUpdate,
      inputsToDelete
    );

    /* 6. */
    inputsToDelete.forEach(async input => await this._customFormInputRepository.delete(input.id));
    inputsToUpdate.forEach(async input => await this._customFormInputRepository.save(input));
    inputsToAdd.forEach(async input => await this._customFormInputRepository.save(input));
  }

  /**
   * Setup column name and type from input label and type.
   * 
   * @param createCustomInputsFormDto The custom form inputs configuration.
   */
  setUpColumnNameAndType(createCustomInputsFormDto: Array<CreateCustomFormInputDto>) {
    createCustomInputsFormDto.forEach(column => {
      if (column.inputType === 'dropdown' && column.columnType) {
        column.columnType = this.inputTypeDatabaseTypeMap.get(column.columnType);
      } else {
        column.columnType = this.inputTypeDatabaseTypeMap.get(column.inputType);
      }
      column.columnName = stringToLowerCaseWithUnderscore(column.inputLabel);
    });
  }

}
