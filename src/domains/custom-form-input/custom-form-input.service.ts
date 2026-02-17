import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomFormInputDto } from './dto/create-custom-form-input.dto';
import { UpdateCustomFormInputDto } from './dto/update-custom-form-input.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomFormInput } from './entities/custom-form-input.entity';
import { Repository } from 'typeorm';
import { stringToLowerCaseWithUnderscore } from 'src/core/utils/string-transfo-util';
import { SimpleColumnType, SpatialColumnType, WithLengthColumnType, WithPrecisionColumnType, WithWidthColumnType } from 'typeorm/driver/types/ColumnTypes';
import { CustomTableService } from '../custom-table/custom-table.service';
import { CustomTableValidatorService } from '../custom-table/custom-table-validator.service';
import { TableViz } from '../table-viz/entities/table-viz.entity';

@Injectable()
export class CustomFormInputService {

  constructor(
    @InjectRepository(CustomFormInput)
    private _customFormInputRepository: Repository<CustomFormInput>,
    @InjectRepository(TableViz)
    private _tableVizRepository: Repository<TableViz>,
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
    ["number", "int"],
    ["date", "timestamp"],
    ["date-and-time", "timestamp"],
    ["file", "varchar"],
    ["checkbox", "boolean"]
  ]);

  /**
   * Create a new table based on inputs configuration and save inputs metadata.
   * 
   * @param createCustomInputsFormDto The inputs configuration.
   * @param tableName The table name.
   * @param userNavigationPermissions The user navigation permissions.
   * @returns The inputs metadata saved.
   * @description
   * 1. Valid user permission.
   * 2. Map input type to postgres column type and define column name.
   * 3. Create table from table name and column configuration.
   * 4. Save inputs metadata.
   */
  async create(
    createCustomInputsFormDto: Array<CreateCustomFormInputDto>,
    tableName: string,
    userNavigationPermissions: Array<{
      navigationId: string;
      permissionName: string;
      navigationTypeName: string;
    }>
  ) {
    /* 1. */
    await this._customTableValidatorService.validPermission(tableName, 'add', userNavigationPermissions);

    /* 2. */
    createCustomInputsFormDto.forEach(column => {
      if (column.inputType === 'dropdown' && column.columnType) {
        column.columnType = this.inputTypeDatabaseTypeMap.get(column.columnType);
      } else {
        column.columnType = this.inputTypeDatabaseTypeMap.get(column.inputType);
      }
      column.columnName = stringToLowerCaseWithUnderscore(column.inputLabel);
    });

    /* 3. */
    await this._customTableService.createDatabaseTable(tableName, createCustomInputsFormDto);

    /* 4. */
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
   * 1. Valid user permission.
   * 2. Map input type to postgres column type and define column name.
   * 3. Identify new inputs to add.
   * 4. Identify inputs to delete.
   * 5. Identify inputs to update.
   */
  async update(
    tableName: string,
    createCustomInputsFormDto: Array<CreateCustomFormInputDto>,
    userNavigationPermissions: Array<{
      navigationId: string;
      permissionName: string;
      navigationTypeName: string;
    }>
  ) {
    /* 1. */
    await this._customTableValidatorService.validPermission(tableName, 'edit', userNavigationPermissions);

    console.log('TABLE NAME', tableName);
    console.log('PAYLOAD', createCustomInputsFormDto);
    /* 2. */
    createCustomInputsFormDto.forEach(column => {
      if (column.inputType === 'dropdown' && column.columnType) {
        column.columnType = this.inputTypeDatabaseTypeMap.get(column.columnType);
      } else {
        column.columnType = this.inputTypeDatabaseTypeMap.get(column.inputType);
      }
      column.columnName = stringToLowerCaseWithUnderscore(column.inputLabel);
    });

    /* 3. */
    const inputsToAdd = createCustomInputsFormDto.filter(payloadInput => !payloadInput.id);
    console.log('inputs to add', inputsToAdd);

    /* 4. */
    const dbInputs = await this._customFormInputRepository.find({
      where: { tableId: createCustomInputsFormDto[0].tableId }
    });
    const inputsToDelete = dbInputs.filter(dbInput => 
      !createCustomInputsFormDto.find(payloadInput => payloadInput.id === dbInput.id)
    );
    console.log('inputs to delete', inputsToDelete);

    /* 5. */
    const inputsToUpdate = createCustomInputsFormDto.filter(payloadInput => 
      dbInputs.find(dbInput => 
        dbInput.id === payloadInput.id && (
          dbInput.columnName !== payloadInput.columnName ||
          dbInput.columnType !== payloadInput.columnType 
        )
      )
    )
    console.log(inputsToUpdate);

  }

}
