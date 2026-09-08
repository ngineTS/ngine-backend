import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';


@Injectable()
export class CustomTableService {

  constructor(private _dataSource: DataSource) { }

  /**
   * Get content by table name and navigation id.
   * 
   * @param tableName The table name.
   * @param navigationId The navigation id.
   * @returns An array with content.
   */
  async findContentByTableNameAndNavigationId(
    tableName: string,
    navigationId: string,
    orderBy: string | undefined,
    order: 'ASC' | 'DESC' | undefined
  ) {
    if (orderBy && order) {
      return this._dataSource.createQueryBuilder()
      .select('*')
      .from(`${process.env.DB_SCHEMA}.${tableName}`, 't')
      .where('t."navigationId" = :navigationId', { navigationId })
      .orderBy(`"${orderBy}"`, order)
      .execute();
    }

    return this._dataSource.createQueryBuilder()
      .select('*')
      .from(`${process.env.DB_SCHEMA}.${tableName}`, 't')
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
      .into(`${process.env.DB_SCHEMA}.${tableName}`)
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
      .update(`${process.env.DB_SCHEMA}.${tableName}`)
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
      .from(`${process.env.DB_SCHEMA}.${tableName}`)
      .where("id = :id", { id: id })
      .execute();
  }
  
}
