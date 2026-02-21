import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, Table, TableColumn, TableColumnOptions } from 'typeorm';
import { CreateCustomFormInputDto } from '../custom-form-input/dto/create-custom-form-input.dto';
import { CustomTableValidatorService } from './custom-table-validator.service';
import { CustomFormInput } from '../custom-form-input/entities/custom-form-input.entity';


@Injectable()
export class CustomTableService {

  constructor(
    private _dataSource: DataSource,
    private _customTableValidatorService: CustomTableValidatorService
  ) { }

  /**
   * Add record to table.
   * 
   * @param tableName The table name
   * @param payload The record.
   * @param userNavigationPermissions The user navigation permissions.
   * @returns The record saved.
   */
  async addTableRow(tableName: string, payload: any) {
    return this._dataSource.createQueryBuilder()
      .insert()
      .into(`custom_table.${tableName}`)
      .values(payload)
      .execute();
  }

  /**
   * Update table record.
   * 
   * @param tableName The table name.
   * @param id The record id.
   * @param payload The property to update.
   * @param userNavigationPermissions The user navigation permissions.
   * @returns An UpdateResult response.
   */
  async updateTableRow(tableName: string, id: string, payload: any) {
    return this._dataSource.createQueryBuilder()
      .update(`custom_table.${tableName}`)
      .set(payload)
      .where("id = :id", { id: id })
      .execute();
  }

  /**
   * Delete table record. 
   * 
   * @param tableName The table name.
   * @param id The record id.
   * @param userNavigationPermissions The user navigation permissions.
   * @returns A DeleteResult response.
   */
  async deleteTableRow(tableName: string, id: string) {
    return this._dataSource.createQueryBuilder()
      .delete()
      .from(`custom_table.${tableName}`)
      .where("id = :id", { id: id })
      .execute();
  }

  /**
   * Get all table content.
   * 
   * @param tableName The table name.
   * @param userNavigationPermissions The user navigation permissions.
   * @returns An array with content.
   */
  async findTableContentByTableName(tableName: string) {
    return this._dataSource.createQueryBuilder()
      .select('*')
      .from(`custom_table.${tableName}`, 't')
      .execute();
  }
  
  /**
   * Create a postgres table in custom_table schema.
   * 
   * @param tableName The name of the table to be created .
   * @param customFormInputs An array of inputs config used for columns creation.
   * @returns success message.
   * @throws {BadRequestException} If column name or type is missing.
   * @throws {BadRequestException} If error occurs during table creation.
   * @description
   * 1. Setup id column.
   * 2. Setup columns from inputs config.
   * 3. Create table.
   */
  async createDatabaseTable(
    tableName: string,
    customFormInputs: Array<CreateCustomFormInputDto>
  ) {
    const columns: Array<TableColumnOptions> = [];

    columns.push({
      name: 'id',
      type: 'uuid',
      isPrimary: true,
      isGenerated: true,
      generationStrategy: 'uuid',
      isUnique: true,
      isNullable: false
    });

    for (let input of customFormInputs) {
      if (!input.columnType || !input.columnName) {
        throw new BadRequestException('Column name and type are required to create table.');
      }
      columns.push({
        name: input.columnName, 
        type: input.columnType,
        isArray: input.isList,
        isNullable: !input.validators?.includes('required')
      });
    }

    const queryRunner = this._dataSource.createQueryRunner();
    try {
      await queryRunner.createTable(
        new Table({
          schema: 'custom_table',
          name: tableName,
          columns: columns
        }),
        true
      );
    }
    catch (error) {
      throw new BadRequestException(error);
    }
    await queryRunner.release();

    return { message: `${tableName} table created.` };
  }

  /**
   * Update a postgres table in custom_table schema.
   * 
   * @param tableName The name of the table to be created.
   * @param inputsToAdd An array of inputs config used for columns creation.
   * @param inputsToUpdate An array of inputs config used to update table columns.
   * @param inputsToDelete An array of inputs config used to drop table columns.
   * @returns success message.
   * @throws {BadRequestException} If column name or type is missing when adding or updating column.
   * @throws {BadRequestException} If error occurs during table update.
   * @description
   * 1. Add new columns.
   * 2. Update existing columns.
   * 3. Delete columns.
   */
  async updateDatabaseTable(
    tableName: string,
    inputsToAdd: Array<CreateCustomFormInputDto>,
    inputsToUpdate: Array<CreateCustomFormInputDto>,
    inputsToDelete: Array<CustomFormInput>
  ) {
    let queryRunner = this._dataSource.createQueryRunner();

    /* 1. */
    for (let input of inputsToAdd) {
      if (!input.columnType || !input.columnName) {
        throw new BadRequestException('Column name and type are required to add column.');
      }
      try {
        await queryRunner.addColumn(
          `custom_table.${tableName}`,
          new TableColumn({
            name: input.columnName,
            type: input.columnType,
            isArray: input.isList,
            isNullable: true
          })
        );
      }
      catch (error) {
        throw new BadRequestException(error);
      }
    }

    /* 2. */
    for (let input of inputsToUpdate) {
      if (!input.columnType || !input.columnName) {
        throw new BadRequestException('Column name and type are required to update column.');
      }
      try {
        await queryRunner.renameColumn(
          `custom_table.${tableName}`,
          input['oldColumnName'],
          input.columnName
        );
      }
      catch (error) {
        throw new BadRequestException(error);
      }
    }

    /* 3. */
    try {
      await queryRunner.dropColumns(
        `custom_table.${tableName}`,
        inputsToDelete.map(input => input.columnName)
      );
    }
    catch (error) {
      throw new BadRequestException(error);
    }

    await queryRunner.release();
    return { message: `${tableName} table modified.` };
  }

  /**
   * Rename table name if it has changed.
   * 
   * @param oldTableName The old table name.
   * @param newTableName The new table name.
   */
  async renameDatabaseTable(oldTableName: string, newTableName: string) {
    if (oldTableName !== newTableName) {
      const queryRunner = this._dataSource.createQueryRunner();
      await queryRunner.renameTable(`custom_table.${oldTableName}`, newTableName);
      await queryRunner.release();
    }
  }
}
