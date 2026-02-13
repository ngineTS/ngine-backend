import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, Table, TableColumnOptions } from 'typeorm';
import { CreateCustomFormInputDto } from '../custom-form-input/dto/create-custom-form-input.dto';


@Injectable()
export class CustomTableService {

  constructor(private _dataSource: DataSource) { }


  async saveTableContent(tableName: string, payload: any) {
    return await this._dataSource.createQueryBuilder()
      .insert()
      .into(`custom_table.${tableName}`)
      .values(payload)
      .execute();
  }

  async updateTableRow(tableName: string, id: string, payload: any) {
    return await this._dataSource.createQueryBuilder()
      .update(`custom_table.${tableName}`)
      .set(payload)
      .where("id = :id", { id: id })
      .execute();
  }

  async deleteTableRow(tableName: string, id: string) {
    await this._dataSource.createQueryBuilder()
      .delete()
      .from(`custom_table.${tableName}`)
      .where("id = :id", { id: id })
      .execute();
  }

  async findTableContentByTableName(tableName: string) {
    return await this._dataSource.createQueryBuilder()
      .select('*')
      .from(`custom_table.${tableName}`, 't')
      .execute();
  }
  
  /**
   * Create a postgres table in custom_table schema.
   * 
   * @param tableName The name of the table to be created .
   * @param customFormInputs An array of input config used for columns creation.
   * @returns success message.
   * @throws {BadRequestException} If column name or type is missing.
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

    for (let customInput of customFormInputs) {
      if (!customInput.columnType || !customInput.columnName) {
        throw new BadRequestException('Column name and type are required to create table.');
      }
      columns.push({
        name: customInput.columnName, 
        type: customInput.columnType,
        isArray: customInput.isList
      });
    }

    const queryRunner = this._dataSource.createQueryRunner();
    await queryRunner.createTable(
      new Table({
        schema: 'custom_table',
        name: tableName,
        columns: columns
      }),
      true
    );
    await queryRunner.release();

    return { message: `${tableName} table created.` };
  }

}
