import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';


@Injectable()
export class CustomTableService {

  constructor(private _dataSource: DataSource) { }

  /**
   * Get table content by table name and navigation id.
   * 
   * @param tableName The table name.
   * @param navigationId The navigation id.
   * @returns An array with content.
   */
  async findTableContentByTableNameAndNavigationId(
    tableName: string,
    navigationId: string
  ) {
    return this._dataSource.createQueryBuilder()
      .select('*')
      .from(`custom_table.${tableName}`, 't')
      .where('t."navigationId" = :navigationId', { navigationId })
      .execute();
  }

  /**
   * Add record to table.
   * 
   * @param tableName The table name
   * @param payload The record.
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
   * @returns A DeleteResult response.
   */
  async deleteTableRow(tableName: string, id: string) {
    return this._dataSource.createQueryBuilder()
      .delete()
      .from(`custom_table.${tableName}`)
      .where("id = :id", { id: id })
      .execute();
  }
  
}
