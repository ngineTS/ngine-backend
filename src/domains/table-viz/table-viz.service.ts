import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTableVizDto } from './dto/create-table-viz.dto';
import { UpdateTableVizDto } from './dto/update-table-viz.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TableViz } from './entities/table-viz.entity';
import { stringToLowerCaseWithUnderscore } from 'src/core/utils/string-transfo-util';

@Injectable()
export class TableVizService {

  constructor(
    @InjectRepository(TableViz)
    private _tableVizRepository: Repository<TableViz>,
    private _dataSource: DataSource
  ) { }

  /**
   * Save table viz.
   * 
   * @param createTableVizDto Table viz payload.
   * @returns The table viz object saved.
   */
  async create(createTableVizDto: CreateTableVizDto) {
    createTableVizDto.tableName = stringToLowerCaseWithUnderscore(createTableVizDto.tableLabel);
    return await this._tableVizRepository.save(createTableVizDto);
  }

  /**
   * Update table viz.
   * 
   * @param id The table viz id.
   * @param updateTableVizDto The table viz properties to update.
   * @returns An UpdateResult object.
   * @throws {NotFoundException} If table viz id not found.
   */
  async update(id: string, updateTableVizDto: UpdateTableVizDto) {
    const updateResult = await this._tableVizRepository.update(id, updateTableVizDto);

    if (updateResult.affected === 0) {
      throw new NotFoundException(`Table viz id ${id} not found.`);
    }

    return updateResult;
  }

  /**
   * Retrieve table viz by navigation id.
   * 
   * @param navigationId The navigation id.
   * @returns The table viz and relations.
   */
  async findByNavigationId(navigationId) {
    return await this._tableVizRepository.findOne({ 
      where: { navigationId },
      relations: ['customFormInputs']
    })
  }

  /**
   * Find all table names under given schema.
   * 
   * @param schema The db schema (default my_app).
   * @returns The promise of table names array.
   */
  async findTableNames(schema: string = 'my_app'): Promise<Array<string>> {
    const result: Array<any> = await this._dataSource.query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = $1 
       ORDER BY table_name;`,
      [schema],
    );
    return result.map((row: { table_name: string }) => row.table_name);
  }

  /**
   * Get all record pof given table.
   * 
   * @param tableName The table name.
   * @returns The table content.
   */
  async findTableContentByTableName(tableName: string) {
    return await this._dataSource.createQueryBuilder()
      .select('*')
      .from(`my_app.${tableName}`, 't')
      .execute();
  }

}
